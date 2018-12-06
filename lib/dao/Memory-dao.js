
const Dao = require('./Dao')

class MemoryDao extends Dao {
  constructor () {
    super()
    this.uuid = 0
    this.executions = {}
  }

  /// ////////////////////////////////////
  _newExecutionName (stateMachineName) {
    this.uuid++
    return this.uuid.toString()
  } // newExecutionName

  async _findExecution (executionName) {
    return this.executions[executionName]
  } // _findExecution

  async _findExecutionsByParentName (parentExecutionName) {
    return Object.values(this.executions).filter(
      executionDescription => executionDescription.executionOptions.parentExecutionName === parentExecutionName
    )
  }

  async _updateExecution (executionName, updateFn, error) {
    const execution = this.executions[executionName]

    if (!execution) {
      throw error
    }

    updateFn(execution)

    this._saveExecution(execution)

    return execution
  } // _updateExecution

  async _createExecution (execution) {
    return this._saveExecution(execution)
  } // _createExecution

  async _saveExecution (execution) {
    if (!execution) {
      return
    }

    this.executions[execution.executionName] = execution

    return execution
  } // _saveExecution
} // class MemoryDao

module.exports = MemoryDao
