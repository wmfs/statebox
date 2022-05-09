const { v1: uuid } = require('uuid')
const Dao = require('./Dao')

const executionModelDefinition = {
  id: 'execution',
  name: 'executions',
  namespace: 'tymly',
  plural: 'executions',
  primaryKey: ['executionName'],
  description: 'Statebox executions instances',
  type: 'object',
  properties: {
    executionName: {
      type: 'string'
    },
    ctx: {
      type: 'string'
    },
    currentStateName: {
      type: 'string'
    },
    currentResource: {
      type: 'string'
    },
    stateMachineName: {
      type: 'string'
    },
    status: {
      type: 'string'
    },
    executionOptions: {
      type: 'string'
    },
    parentExecution: {
      type: 'string'
    },
    childCount: {
      type: 'integer'
    },
    lastDescribed: {
      type: 'string',
      format: 'date-time'
    }
  },
  required: ['uuid'],
  audit: false,
  indexes: [
    {
      columns: ['status'],
      unique: false
    },
    {
      columns: ['stateMachineName'],
      unique: false
    },
    {
      columns: ['executionName'],
      unique: false
    },
    {
      columns: ['parentExecution'],
      unique: false
    }
  ]
} // executionModelDefinition

class StorageServiceDao extends Dao {
  static get ExecutionModelName () {
    return `${executionModelDefinition.namespace}_${executionModelDefinition.id}`
  }

  // ExecutionModelName
  static get ExecutionModelDefinition () {
    return executionModelDefinition
  } // ExecutionModelDefinition

  constructor (model) {
    super()
    this.count = 0
    this.model = model
  } // constructor

  /// ////////////////////////////////
  _newExecutionName (stateMachineName) {
    return `${stateMachineName}-${uuid()}-${++this.count}`
  } // newExecutionName

  async _findExecution (executionName) {
    const execution = await this.model.findById(executionName)
    return execution
      ? StorageServiceDao.deserialise(execution)
      : null
  } // _findExecution

  async _findExecutionsByParentName (parentExecutionName) {
    const executions = await this.model.find({
      where: {
        parentExecution: { equals: parentExecutionName }
      }
    })
    executions.forEach(StorageServiceDao.deserialise)
    return executions
  } // _findExecutionsByParentName

  static deserialise (execution) {
    try {
      execution.ctx = JSON.parse(execution.ctx)
      execution.executionOptions = JSON.parse(execution.executionOptions)
    } catch (e) {
      //
    }

    if (execution.executionOptions.error) {
      execution.errorCode = execution.executionOptions.error.error
      execution.errorMessage = execution.executionOptions.error.cause
    }
    return execution
  } // deserialise

  async _updateExecution (executionName, updateFn, error) {
    const execution = await this._findExecution(executionName)

    if (!execution) {
      throw error
    }

    updateFn(execution)

    return this._saveExecution(execution)
  } // _updateExecution

  async _createExecution (execution) {
    execution.parentExecution = execution.executionOptions.parentExecutionName
    return this._persist('create', execution)
  } // _createExecution

  async _saveExecution (execution) {
    return this._persist('update', execution)
  } // _saveExecution

  async _persist (action, execution) {
    if (!execution) {
      return
    }

    const ctx = execution.ctx
    const eo = execution.executionOptions
    // we stringify outside the database because ctx could be a primitive value
    // and Postgres explodes when inserting ordinary strings into a jsonb field.
    execution.ctx = JSON.stringify(execution.ctx)
    execution.executionOptions = JSON.stringify(execution.executionOptions)
    await this.model[action](execution, {})

    execution.ctx = ctx
    execution.executionOptions = eo
    return execution
  } // _persist
} // class StorageServiceDao

module.exports = StorageServiceDao
