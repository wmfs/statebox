const Status = require('../Status')
const boom = require('boom')

class Dao {
  /// /////////////////////////
  /// Public interface
  createNewExecution (startAt, startResource, input, stateMachineName, executionOptions) {
    const executionName = this._newExecutionName(stateMachineName)
    const executionDescription = {
      executionName: executionName,
      ctx: input,
      currentStateName: startAt,
      currentResource: startResource,
      stateMachineName: stateMachineName,
      status: Status.RUNNING,
      executionOptions: executionOptions,
      startDate: new Date().toISOString()
    }

    return this._createExecution(executionDescription)
  } // _createNewExecution

  stopExecution (cause, errorCode, executionName, executionOptions) {
    return this._updateExecution(
      executionName,
      execution => {
        execution.status = Status.STOPPED
        execution.errorCause = execution.errorCause || cause
        execution.errorCode = execution.errorCode || errorCode
      },
      boom.badRequest(`Unable to stop execution with name '${executionName}'`)
    )
  } // stopExecution

  findExecutionByName (executionName) {
    return this._findExecution(executionName)
  } // findExecutionByName

  succeedExecution (executionName, ctx) {
    return this._updateExecution(
      executionName,
      execution => {
        execution.status = Status.SUCCEEDED
        execution.ctx = ctx

        execution.executionOptions.error = null
      },
      boom.badRequest(`Unable to succeed execution with name '${executionName}'`)
    )
  } // succeedExecution

  failExecution (executionDescription, errorMessage, errorCode) {
    const executionName = executionDescription.executionName

    return this._updateExecution(
      executionName,
      execution => {
        execution.status = Status.FAILED
        execution.errorCode = errorCode
        execution.errorMessage = errorMessage

        execution.executionOptions.error = {
          error: errorCode,
          cause: errorMessage
        }

        return this._markRelatedBranchesAsFailed(executionDescription.executionOptions.rootExecutionName)
      },
      boom.badRequest(`Unable to fail execution with name '${executionName}'`)
    )
  } // failExecution

  setNextState (executionName, nextStateName, nextResource, ctx) {
    return this._updateExecution(
      executionName,
      execution => {
        execution.ctx = ctx
        execution.currentStateName = nextStateName
        execution.currentResource = nextResource

        execution.executionOptions.error = null
      },
      boom.badRequest(`Unable to set next state name for execution with name '${executionName}'`)
    )
  } // setNextState

  updateCurrentStateName (stateName, currentResource, executionName) {
    return this._updateExecution(
      executionName,
      execution => {
        execution.currentStateName = stateName
        execution.currentResource = currentResource
      },
      boom.badRequest(`Unable to update state name for execution with name '${executionName}'`)
    )
  } // updateCurrentStateName

  /// //////////////////////
  /// Implementation
  _markRelatedBranchesAsFailed (executionName) {
    if (!executionName) {
      return
    }

    return this._updateExecution(
      executionName,
      execution => {
        execution.status = Status.FAILED
        execution.errorCause = execution.errorCause || 'States.BranchFailed'
        execution.errorCode = execution.errorCode || 'Failed because a state in a parallel branch has failed'

        execution.executionOptions.error = {
          error: execution.errorCode,
          cause: execution.errorMessage
        }
      },
      boom.badRequest(`Unable to set failed state for execution named ${executionName}`)
    )
  } // _markRelatedBrancesAsFailed

  /// ///////////
  /// subclass provides
  /// _newExecutionName (stateMachineName) -> string
  /// async _findExecution (executionName) -> execution
  /// async _updateExecution (executionName, updateFn, errorMsg) -> execution
  /// async _createExecution (execution) -> execution
} // class Dao

module.exports = Dao
