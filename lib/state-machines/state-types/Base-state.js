
const debugPackage = require('debug')('statebox')
const _ = require('lodash')
const Status = require('../../Status')
const States = require('./errors')
const ExecutionContext = require('./execution-context')

const PathHandlers = require('./path-handlers')

class BaseState {
  constructor (stateName, stateMachine, stateDefinition, options) {
    this.name = stateName
    this.stateMachine = stateMachine
    this.stateMachineName = stateMachine.name
    this.definition = stateDefinition
    this.dao = options.dao
    this.stateMachines = options.stateMachines
    this.callbackManager = options.callbackManager

    this.inputSelector = PathHandlers.Input(stateDefinition.InputPath, stateDefinition.Parameters)
    this.applyResult = PathHandlers.Result(stateDefinition.ResultPath, stateDefinition.ResultSelector)
    this.outputSelector = PathHandlers.Output(stateDefinition.OutputPath)
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

  run (executionDescription) {
    try {
      const input = this.inputSelector(executionDescription.ctx, ExecutionContext(executionDescription))
      return this.process(executionDescription, input)
    } catch (e) {
      return this.processTaskFailure(e, executionDescription.executionName)
    }
  } // run

  // State Failure
  async processTaskFailure (errorInfo, executionName) {
    const executionDescription = await this.dao.findExecutionByName(
      executionName
    )

    return this.runTaskFailure(
      executionDescription,
      errorInfo
    )
  } // processTaskFailure

  async runTaskFailure (executionDescription, errorInfo) {
    const executionName = executionDescription.executionName
    const stateDefinition = this.stateMachines.findStateDefinition(
      executionDescription.stateMachineName,
      executionDescription.currentStateName
    )

    // Error Recovery
    const catchHandler = this.hasCatchHandler(stateDefinition, errorInfo.error)
    if (catchHandler) {
      return this.runTaskNextState(
        executionDescription,
        catchHandler,
        executionDescription.ctx
      )
    }

    // Everything's trashed
    const failedExecutionDescription = await this.dao.failExecution(
      executionName,
      errorInfo
    )

    this.fireExecutionCompleted(
      executionName,
      failedExecutionDescription
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

  async runTaskHeartbeat (executionDescription, updateResult, isLast = false) {
    const executionName = executionDescription.executionName
    const intermediateResult = this.applyResult(executionDescription.ctx, updateResult)
    const output = this.outputSelector(intermediateResult)

    executionDescription.ctx = _.defaultsDeep(output, executionDescription.ctx)

    await this.dao.setNextState(
      executionName, // executionName
      executionDescription.currentStateName, // nextStateName
      executionDescription.currentResource, // nextResource
      executionDescription.ctx
    )

    if (isLast) {
      // this was the last heartbeat, so advance to the next stage
      this.runTaskSuccess(executionDescription, executionName.ctx)
    }

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

    const stateDefinition = this.stateMachines.findStateDefinition(
      executionDescription.stateMachineName,
      executionDescription.currentStateName
    )

    // END
    if (stateDefinition.End || stateDefinition.Type === 'Succeed' || stateDefinition.Type === 'Fail') {
      return this.runTaskEnd(executionName, executionDescription, output)
    } else {
      // NEXT
      return this.runTaskNextState(executionDescription, stateDefinition.Next, output)
    }
  } // runTaskSuccess

  async runTaskEnd (executionName, executionDescription, ctx) {
    const succeededExecutionDescription = await this.dao.succeedExecution(
      executionName,
      ctx
    )

    this.fireExecutionCompleted(
      executionName,
      succeededExecutionDescription
    )

    return succeededExecutionDescription
  } // runTaskEnd

  async handleChildExecutionComplete (
    parentExecutionName,
    parentStateMachineName,
    parentStateName
  ) {
    const allChildren = await this.dao.findExecutionsByParentName(parentExecutionName)
    const failedChildren = allChildren.filter(child => child.status === Status.FAILED)
    const failedCount = failedChildren.length

    if (failedCount === 0) {
      debugPackage(`All branches have now succeeded in ${parentExecutionName}`)

      const parentCtx = makeParentContext(allChildren)
      const parentState = this.stateMachines.findState(
        parentStateMachineName,
        parentStateName
      )
      return parentState.processTaskSuccess(parentExecutionName, parentCtx)
    } else {
      const firstError = failedChildren[0].errorMessage
      this.processTaskFailure(
        States.BranchFailed.error(
          firstError || 'Failed because a state in a parallel branch has failed'
        ),
        parentExecutionName
      )
      debugPackage(`${failedCount} branches of ${allChildren.length} failed in ${parentExecutionName}`)
    }
  } // handleChildExecutionSuccess

  async runTaskNextState (executionDescription, nextStateName, ctx) {
    const executionName = executionDescription.executionName
    const stateMachine = this.stateMachines.findStateMachineByName(executionDescription.stateMachineName)
    const nextDefinition = stateMachine.findStateDefinitionByName(nextStateName)

    const nextResource = nextDefinition.Resource
    await this.dao.setNextState(
      executionName,
      nextStateName, // nextStateName
      nextResource,
      ctx
    )
    // TODO: Error needs handling as per spec
    return stateMachine.processState(executionName)
  } // runTaskNextState

  fireExecutionCompleted (executionName, executionDescription) {
    this.callbackManager.fireCallback(
      Status.COMPLETE,
      executionName,
      executionDescription
    )
  } // fireExecutionComplete
} // class BaseState

function makeParentContext (allChildren) {
  const ctx = []
  for (const child of allChildren) {
    const branchIndex = child.executionOptions.branchIndex
    const childCtx = child.ctx

    ctx[branchIndex] = childCtx
  }
  return ctx
}

module.exports = BaseState
