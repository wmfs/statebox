'use strict'
const debug = require('debug')('statebox')
const stateTypes = require('./state-types')
const boom = require('@hapi/boom')

class StateMachine {
  init (stateMachineName, definition, stateMachineMeta, env, options) {
    this.name = stateMachineName
    this.definition = definition
    this.meta = stateMachineMeta
    this.startAt = definition.StartAt
    this.states = {}
    this.options = options
    this.callbackManager = options.callbackManager
    debug(`Creating '${stateMachineName}' stateMachine (${definition.Comment || 'No stateMachine comment specified'})`)

    const createStates = Object.entries(definition.States)
      .map(([stateName, stateDefinition]) =>
        this._createStateDefinition(stateMachineName, stateDefinition, stateName, env)
      )
    return Promise.all(createStates)
  } // init

  async _createStateDefinition (stateMachineName, stateDefinition, stateName, env) {
    const State = stateTypes[stateDefinition.Type]
    if (!State) {
      throw boom.badRequest(`Unable to create state machine '${stateMachineName}' - failed to find state-type '${stateDefinition.Type}'. Does state '${stateName}' have a type property set?`)
    }

    const state = new State(stateName, this, stateDefinition, this.options)
    await state.initialise(env)
    this.states[stateName] = state
  } // _createStateDefinition

  findStateByName (name) {
    return this.states[name]
  }

  findStateDefinitionByName (name) {
    const state = this.states[name]
    return state ? state.definition : null
  } // findStateDefinitionByName

  runState (executionDescription) {
    const stateNameToRun = executionDescription.currentStateName
    const stateToRun = this.findStateByName(stateNameToRun)
    if (!stateToRun) {
      // TODO: Need to handle trying to run an unknown state (should be picked-up in validation though)
      throw (boom.badRequest(`Unknown state '${stateNameToRun}' in stateMachine '${this.name}'`))
    }

    debug(`About to process ${stateToRun.stateType} '${stateNameToRun}' in stateMachine '${this.name}' stateMachine (executionName='${executionDescription.executionName}')`)

    this.enteringState(executionDescription)

    const latch = stateToRun.run(executionDescription)

    if (!Array.isArray(latch)) return latch

    const [onComplete, onHeartbeat] = latch
    onHeartbeat.then(updatedExecutionDescription => this.leftState(updatedExecutionDescription))
    return onComplete
  } // runState

  enteringState (executionDescription) {
    this.callbackManager.fireCallback(
      `ENTERING:${executionDescription.currentStateName}`,
      executionDescription.executionName,
      executionDescription
    )
  } // enteringState

  async leftState (executionDescription) {
    if (!executionDescription.currentResource) return

    const resourceName = executionDescription.currentResource.split(':')[1]
    const eventName = `AFTER_RESOURCE_CALLBACK.TYPE:${resourceName}`

    this.callbackManager.fireCallback(
      eventName,
      executionDescription.executionName,
      executionDescription
    )
  } // leftState

  async processState (executionName) {
    const executionDescription = await this.options.dao.findExecutionByName(executionName)
    return this.runState(executionDescription)
  } // processState
} // class StateMachine

module.exports = StateMachine
