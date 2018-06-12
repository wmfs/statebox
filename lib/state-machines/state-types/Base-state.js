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
    this.options = options
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
    await this.options.dao.updateCurrentStateName(
      nextStateName,
      nextResource,
      executionName
    )
    // TODO:Error needs handling as per spec
    this.stateMachine.processState(executionName)
  } // updateCurrentStateName

  runTaskFailure (executionDescription, options, callback) {
    let ctx = executionDescription.ctx
    const stateMachine = stateMachines.findStateMachineByName(executionDescription.stateMachineName)
    const stateDefinition = stateMachine.findStateDefinitionByName(executionDescription.currentStateName)
    const executionName = executionDescription.executionName

    let throwException = false
    if (stateDefinition.Catch) {
      let caughtException = false
      for (let catchBlock of stateDefinition.Catch) {
        let catchNext
        for (let exceptionName of catchBlock.ErrorEquals) {
          if (exceptionName === options.error || exceptionName === 'States.ALL') {
            catchNext = catchBlock.Next
            break
          }
        }

        if (catchNext) {
          caughtException = true
          const nextResource = stateMachine.findStateDefinitionByName(catchNext).Resource
          this.options.dao.setNextState(
            executionName, // executionName
            catchNext, // nextStateName
            nextResource,
            ctx, // ctx
            function (err) {
              if (err) {
                // TODO: Needs handling as per spec
                throw new Error(err)
              } else {
                stateMachine.processState(executionName)
              }
            }
          )
          break
        }
      }

      if (!caughtException) {
        // all catch blocks were evaluated, but no matches were found
        throwException = true
      }
    } else {
      // no catch blocks were defined in the state definition
      throwException = true
    }

    if (throwException) {
      const tracker = this.options.parallelBranchTracker
      tracker.registerChildExecutionFail(executionName)
      this.options.dao.failExecution(
        executionDescription,
        options.cause,
        options.error,
        function (err, failedExecutionDescription) {
          if (err) {
            callback(err)
          } else {
            callback(null, failedExecutionDescription)
          }
        }
      )
    }
  }

  runTaskHeartbeat (executionDescription, output, callback) {
    const executionName = executionDescription.executionName
    const tracker = this.options.parallelBranchTracker
    tracker.registerChildExecutionFail(executionName)
    executionDescription.ctx = _.defaults(output, executionDescription.ctx)
    this.options.dao.setNextState(
      executionName, // executionName
      executionDescription.currentStateName, // nextStateName
      executionDescription.currentResource, // nextResource
      executionDescription.ctx, // ctx
      function (err) {
        if (err) {
          callback(err)
        } else {
          callback(null, executionDescription)
        }
      }
    )
  }

  processTaskHeartbeat (output, executionName, callback) {
    const _this = this
    this.options.dao.findExecutionByName(
      executionName,
      function (err, executionDescription) {
        if (err) {
          // TODO: Handle this as per spec!
          throw (err)
        } else {
          _this.runTaskHeartbeat(
            executionDescription,
            output,
            callback
          )
        }
      }
    )
  }

  processTaskFailure (options, executionName) {
    const _this = this
    this.options.dao.findExecutionByName(
      executionName,
      function (err, executionDescription) {
        if (err) {
          // TODO: Handle this as per spec!
          throw (err)
        } else {
          _this.runTaskFailure(
            executionDescription,
            options,
            function (err, failedExecutionDescription) {
              if (err) {
                throw new Error(err)
              } else {
                _this.options.callbackManager.fireCallback(
                  Status.COMPLETE,
                  executionName,
                  failedExecutionDescription
                )
              }
            }
          )
        }
      }
    )
  }

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
      this.runTaskEnd(executionName, executionDescription, ctx)
    } else {
      // NEXT
      this.runTaskNextState(executionName, stateMachine, stateDefinition, ctx)
    }
  } // runTaskSuccess

  async runTaskEnd (executionName, executionDescription, ctx) {
    const succeededExecutionDescription = await this.options.dao.succeedExecution(
      executionName,
      ctx
    )
    const parentExecutionName = executionDescription.executionOptions.parentExecutionName
    if (parentExecutionName) {
      // Has a parent flow, so see if the related parallel state can advance
      const tracker = this.options.parallelBranchTracker
      tracker.registerChildExecutionEnd(executionDescription.executionName)
      const parallelStateStatus = tracker.getParallelTaskStatus(parentExecutionName)
      if (parallelStateStatus === Status.SUCCEEDED) {
        debugPackage(`All branches have now succeeded (executionName='${executionDescription.executionOptions.parentExecutionName}')`)
        this.processTaskSuccess(parentExecutionName, ctx)
      }
    } else {
      // No branching, so finished everything... might need to call a callback?
      this.options.callbackManager.fireCallback(
        Status.COMPLETE,
        executionName,
        succeededExecutionDescription
      )
    }
  } // runTaskEnd

  async runTaskNextState (executionName, stateMachine, stateDefinition, ctx) {
    const nextResource = stateMachine.findStateDefinitionByName(stateDefinition.Next).Resource
    await this.options.dao.setNextState(
      executionName, // executionName
      stateDefinition.Next, // nextStateName
      nextResource,
      ctx
    )
    // TODO: Error needs handling as per spec
    stateMachine.processState(executionName)
  } // runTaskNextState

  async processTaskSuccess (executionName, output) {
    const executionDescription = await this.options.dao.findExecutionByName(executionName)
    // TODO: Handle failure as per spec!
    this.runTaskSuccess(executionDescription, output)
  } // processTaskSuccess
}

module.exports = BaseState
