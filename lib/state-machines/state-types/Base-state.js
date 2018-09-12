'use strict'
const debugPackage = require('debug')('statebox')
const stateMachines = require('./../../state-machines')
const _ = require('lodash')
const dottie = require('dottie')
const Status = require('../../Status')

class BaseState {
  constructor (stateName, stateMachine, stateDefinition, options) {
    this.name = stateName
    this.stateMachine = stateMachine
    this.stateMachineName = stateMachine.name
    this.definition = stateDefinition
    this.dao = options.dao
    this.parallelBranchTracker = options.parallelBranchTracker
    this.callbackManager = options.callbackManager
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

  async updateCurrentStateName (nextStateName, nextResource, executionName) {
    await this.dao.updateCurrentStateName(
      nextStateName,
      nextResource,
      executionName
    )
    // TODO:Error needs handling as per spec
    this.stateMachine.processState(executionName)
  } // updateCurrentStateName

  async runTaskFailure (executionDescription, options) {
    const ctx = executionDescription.ctx
    const stateMachine = stateMachines.findStateMachineByName(executionDescription.stateMachineName)
    const stateDefinition = stateMachine.findStateDefinitionByName(executionDescription.currentStateName)
    const executionName = executionDescription.executionName

    const catchHandler = this.hasCatchHandler(stateDefinition, options.error)

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
      options.error,
      options.cause
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

  async processTaskFailure (options, executionName) {
    const executionDescription = await this.dao.findExecutionByName(
      executionName
    )

    const failedExecutionDescription = await this.runTaskFailure(
      executionDescription,
      options
    )

    this.callbackManager.fireCallback(
      Status.COMPLETE,
      executionName,
      failedExecutionDescription
    )
  } // processTaskFailure

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

  async processTaskHeartbeat (output, executionName) {
    const executionDescription = await this.dao.findExecutionByName(
      executionName
    )

    return this.runTaskHeartbeat(
      executionDescription,
      output
    )
  } // processTaskHeartbeat

  runTaskSuccess (executionDescription, output) {
    const executionName = executionDescription.executionName
    let ctx = executionDescription.ctx
    if (output) {
      if (this.resultPath) {
        dottie.set(ctx, this.resultPath, output)
      } else {
        ctx = _.defaults(output, ctx)
      }
    }
    const stateMachine = stateMachines.findStateMachineByName(executionDescription.stateMachineName)
    const stateDefinition = stateMachine.findStateDefinitionByName(executionDescription.currentStateName)

    // END
    if (stateDefinition.End) {
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

  async processTaskSuccess (executionName, output) {
    const executionDescription = await this.dao.findExecutionByName(executionName)
    // TODO: Handle failure as per spec!
    this.runTaskSuccess(executionDescription, output)
  } // processTaskSuccess

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

module.exports = BaseState
