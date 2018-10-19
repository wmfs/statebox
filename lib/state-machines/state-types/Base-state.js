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
    this.parallelBranchTracker = options.parallelBranchTracker
    this.callbackManager = options.callbackManager

    this.inputSelector = findInputSelector(stateDefinition.InputPath)
    this.applyResult = findResultPathHandler(stateDefinition.ResultPath)
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
    this.process(executionDescription, input, optionalDoneCallback)
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

    const tracker = this.parallelBranchTracker
    tracker.registerChildExecutionFail(executionName)
    const failedExecutionDescription = await this.dao.failExecution(
      executionDescription,
      errorInfo
    )
    return failedExecutionDescription
  } // runTaskFailure

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
    const tracker = this.parallelBranchTracker
    tracker.registerChildExecutionFail(executionName)
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
    this.runTaskSuccess(executionDescription, output)
  } // processTaskSuccess

  runTaskSuccess (executionDescription, output) {
    const executionName = executionDescription.executionName
    const ctx = this.applyResult(executionDescription.ctx, output)

    const stateMachine = stateMachines.findStateMachineByName(executionDescription.stateMachineName)
    const stateDefinition = stateMachine.findStateDefinitionByName(executionDescription.currentStateName)

    // END
    if (stateDefinition.End || stateDefinition.Type === 'Succeed') {
      return this.runTaskEnd(executionName, executionDescription, ctx)
    } else {
      // NEXT
      return this.runTaskNextState(executionName, stateMachine, stateDefinition.Next, ctx)
    }
  } // runTaskSuccess

  async runTaskEnd (executionName, executionDescription, ctx) {
    const succeededExecutionDescription = await this.dao.succeedExecution(
      executionName,
      ctx
    )
    const parentExecutionName = executionDescription.executionOptions.parentExecutionName
    if (parentExecutionName) {
      // Has a parent flow, so see if the related parallel state can advance
      const tracker = this.parallelBranchTracker
      tracker.addToCtx(ctx)
      tracker.registerChildExecutionEnd(executionDescription.executionName)
      const parallelStateStatus = tracker.getParallelTaskStatus(parentExecutionName)
      if (parallelStateStatus === Status.SUCCEEDED) {
        debugPackage(`All branches have now succeeded (executionName='${executionDescription.executionOptions.parentExecutionName}')`)
        this.processTaskSuccess(parentExecutionName, tracker.ctx)
      }
    } else {
      // No branching, so finished everything... might need to call a callback?
      this.callbackManager.fireCallback(
        Status.COMPLETE,
        executionName,
        succeededExecutionDescription
      )
    }

    return succeededExecutionDescription
  } // runTaskEnd

  async runTaskNextState (executionName, stateMachine, nextState, ctx) {
    const nextResource = stateMachine.findStateDefinitionByName(nextState).Resource
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
function findInputSelector (inputPath) {
  if (inputPath === null) {
    return nullInput
  }

  if (inputPath === undefined || inputPath === '$') {
    return defaultInput
  }

  return ctx => selectInputPath(inputPath, ctx)
} // findInputSelector

function nullInput () {
  return { }
} // nullInput

function defaultInput (ctx) {
  return _.cloneDeep(ctx)
} // defaultInput

function selectInputPath (inputPath, ctx) {
  try {
    return _.cloneDeep(jp.value(ctx, inputPath))
  } catch (err) {
    console.log(`Could not apply ${inputPath} to ${JSON.stringify(ctx)}`)
  }
} // selectInputPath

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
  return result ? _.defaults(result, ctx) : ctx
  // return result
} // defaultResultPath

function applyResultPath (rp, ctx, result) {
  if (result) {
    dottie.set(ctx, rp, result)
  }
  return ctx
} // applyResultPath

module.exports = BaseState
