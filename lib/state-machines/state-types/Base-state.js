'use strict'
const debugPackage = require('debug')('statebox')
const stateMachines = require('./../../state-machines')
const _ = require('lodash')
const dottie = require('dottie')
const jp = require('jsonpath')
const Status = require('../../Status')
const convertJsonpathToDottie = require('./../../utils/convert-jsonpath-to-dottie')

class BaseState {
  constructor (stateName, stateMachine, stateDefinition, options) {
    this.name = stateName
    this.stateMachine = stateMachine
    this.stateMachineName = stateMachine.name
    this.definition = stateDefinition
    this.dao = options.dao
    this.callbackManager = options.callbackManager

    this.inputSelector = findSelector(stateDefinition.InputPath)
    this.applyResult = findResultPathHandler(stateDefinition.ResultPath)
    this.outputSelector = findSelector(stateDefinition.OutputPath)
  } // constructor

  initialise (env) {
    if (!this.stateTypeInit) {
      return
    }

    return this.stateTypeInit(env)
  } // initialise

  debug () {
    debugPackage(` - Created '${this.name}' ${this.stateType} within stateMachine '${this.stateMachine.name}'`)
  } // debug

  run (executionDescription, optionalDoneCallback) {
    const input = this.inputSelector(executionDescription.ctx)
    return this.process(executionDescription, input, optionalDoneCallback)
  } // run

  // State Failure
  async processTaskFailure (errorInfo, executionName) {
    const executionDescription = await this.dao.findExecutionByName(
      executionName
    )

    const failedExecutionDescription = await this.runTaskFailure(
      executionDescription,
      errorInfo
    )

    this.callbackManager.fireCallback(
      Status.COMPLETE,
      executionName,
      failedExecutionDescription
    )

    return failedExecutionDescription
  } // processTaskFailure

  async runTaskFailure (executionDescription, errorInfo) {
    const ctx = executionDescription.ctx
    const stateMachine = stateMachines.findStateMachineByName(executionDescription.stateMachineName)
    const stateDefinition = stateMachine.findStateDefinitionByName(executionDescription.currentStateName)
    const executionName = executionDescription.executionName

    const catchHandler = this.hasCatchHandler(stateDefinition, errorInfo.error)

    if (catchHandler) {
      return this.runTaskNextState(
        executionName,
        stateMachine,
        catchHandler,
        ctx
      )
    }

    const failedExecutionDescription = await this.dao.failExecution(
      executionDescription,
      errorInfo
    )

    this.handleChildExecutionFail(executionDescription, errorInfo)

    return failedExecutionDescription
  } // runTaskFailure

  handleChildExecutionFail (executionDescription, errorInfo) {
    const parentExecutionName = executionDescription.executionOptions.parentExecutionName
    if (!parentExecutionName) return

    debugPackage(`Branch ${executionDescription.executionName} failed in  ${parentExecutionName}`)
    this.processTaskFailure(
      {
        error: 'States.BranchFailed',
        cause: errorInfo.cause || 'Failed because a state in a parallel branch has failed'
      },
      parentExecutionName
    )
  } // handleChildExecutionFail

  hasCatchHandler (stateDefinition, errorRaised) {
    if (!stateDefinition.Catch) {
      return null
    }

    for (const catchBlock of stateDefinition.Catch) {
      for (const exceptionName of catchBlock.ErrorEquals) {
        if (exceptionName === errorRaised || exceptionName === 'States.ALL') {
          return catchBlock.Next
        }
      } // for ...
    } // for ...

    return null
  } // hasCatchHandler

  // State Heartbeat
  async processTaskHeartbeat (output, executionName) {
    const executionDescription = await this.dao.findExecutionByName(
      executionName
    )

    return this.runTaskHeartbeat(
      executionDescription,
      output
    )
  } // processTaskHeartbeat

  async runTaskHeartbeat (executionDescription, output) {
    const executionName = executionDescription.executionName
    executionDescription.ctx = _.defaults(output, executionDescription.ctx)

    await this.dao.setNextState(
      executionName, // executionName
      executionDescription.currentStateName, // nextStateName
      executionDescription.currentResource, // nextResource
      executionDescription.ctx
    )

    return executionDescription
  } // runTaskHeartbeat

  // Task Success
  async processTaskSuccess (executionName, output) {
    const executionDescription = await this.dao.findExecutionByName(executionName)
    // TODO: Handle failure as per spec!
    return this.runTaskSuccess(executionDescription, output)
  } // processTaskSuccess

  runTaskSuccess (executionDescription, result) {
    const executionName = executionDescription.executionName
    const intermediateResult = this.applyResult(executionDescription.ctx, result)
    const output = this.outputSelector(intermediateResult)

    const stateMachine = stateMachines.findStateMachineByName(executionDescription.stateMachineName)
    const stateDefinition = stateMachine.findStateDefinitionByName(executionDescription.currentStateName)

    // END
    if (stateDefinition.End || stateDefinition.Type === 'Succeed' || stateDefinition.Type === 'Fail') {
      return this.runTaskEnd(executionName, executionDescription, output)
    } else {
      // NEXT
      return this.runTaskNextState(executionName, stateMachine, stateDefinition.Next, output)
    }
  } // runTaskSuccess

  async runTaskEnd (executionName, executionDescription, ctx) {
    const succeededExecutionDescription = await this.dao.succeedExecution(
      executionName,
      ctx
    )

    this.handleChildExecutionSuccess(executionDescription)

    this.callbackManager.fireCallback(
      Status.COMPLETE,
      executionName,
      succeededExecutionDescription
    )

    return succeededExecutionDescription
  } // runTaskEnd

  async handleChildExecutionSuccess (executionDescription) {
    const parentExecutionName = executionDescription.executionOptions.parentExecutionName

    if (!parentExecutionName) return

    const allChildren = await this.dao.findExecutionsByParentName(parentExecutionName)
    const completedCount = allChildren.filter(child => child.status !== Status.RUNNING).length
    const failedCount = allChildren.filter(child => child.status === Status.FAILED).length

    const parentCompleted = (completedCount === allChildren.length)
    const parentSucceeded = parentCompleted && (failedCount === 0)

    if (parentCompleted) {
      debugPackage(`All branches have now succeeded in ${parentExecutionName}`)

      const parentCtx = makeParentContext(allChildren)
      this.processTaskSuccess(parentExecutionName, parentCtx)
    } else if (parentSucceeded) {
      debugPackage(`All branches have now completed in ${parentExecutionName} with ${failedCount} failures`)
    } else {
      debugPackage(`${completedCount} of ${allChildren.length} completed in ${parentExecutionName}`)
    }
  } // handleChildExecutionSuccess

  async runTaskNextState (executionName, stateMachine, nextState, ctx) {
    const nextDefinition = stateMachine.findStateDefinitionByName(nextState)
    const nextResource = nextDefinition.Resource
    await this.dao.setNextState(
      executionName, // executionName
      nextState, // nextStateName
      nextResource,
      ctx
    )
    // TODO: Error needs handling as per spec
    return stateMachine.processState(executionName)
  } // runTaskNextState
} // class BaseState

// See https://states-language.net/spec.html#filters
// A _Path === null is specified as being distinct from an undefined Path
// InputPath
function findSelector (path) {
  if (path === null) {
    return nullSelection
  }

  if (path === undefined || path === '$') {
    return defaultSelection
  }

  return ctx => selectPath(path, ctx)
} // findSelector

function nullSelection () {
  return { }
} // nullSelection

function defaultSelection (ctx) {
  return _.cloneDeep(ctx)
} // defaultSelection

function selectPath (path, ctx) {
  return _.cloneDeep(jp.value(ctx, path))
} // selectPath

// ResultPath
function findResultPathHandler (resultPath) {
  if (resultPath === null) {
    return nullResultPath
  }

  if (resultPath === undefined || resultPath === '$') {
    return defaultResultPath
  }

  const rp = convertJsonpathToDottie(resultPath)
  return (ctx, result) => applyResultPath(rp, ctx, result)
} // selectResultPathHolder

function nullResultPath (ctx) {
  return ctx
} // function nullResultPath

function defaultResultPath (ctx, result) {
  // THIS IS NOT THE CORRECT BEHAVIOUR, BUT CHANGING NOW WOULD BREAK EXISTING STATE MACHINES
  if (!result) return ctx

  if (!_.isObject(result)) return result

  return _.defaults(result, ctx)
  // return result
} // defaultResultPath

function applyResultPath (rp, ctx, result) {
  if (result) {
    dottie.set(ctx, rp, result)
  }
  return ctx
} // applyResultPath

function makeParentContext (allChildren) {
  const ctx = [ ]
  for (const child of allChildren) {
    const branchIndex = child.executionOptions.branchIndex
    const childCtx = child.ctx

    ctx[branchIndex] = childCtx
  }
  return ctx
}

module.exports = BaseState
