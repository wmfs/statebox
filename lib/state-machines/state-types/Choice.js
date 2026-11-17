'use strict'
const BaseStateType = require('./Base-state')
const debugPackage = require('debug')('statebox')
const aslChoiceProcessor = require('@wmfs/asl-choice-processor')
const States = require('./errors')

class Choice extends BaseStateType {
  constructor (stateName, stateMachine, stateDefinition, options) {
    super(stateName, stateMachine, stateDefinition, options)
    this.stateType = 'Choice'
    this.states = stateMachine.states
    this.calculateNextState = compileChoices(stateName, stateMachine.name, stateDefinition)
    this.debug()
  }

  process (executionDescription, input) {
    const nextStateName = this.calculateNextState(input)
    const nextState = this.states[nextStateName]

    if (!nextState) {
      return this.noMatchingChoice(executionDescription)
    } // if (!nextState) {

    const nextResource = nextState.definition.Resource
    this.updateCurrentStateName(nextStateName, nextResource, executionDescription)
  } // process

  async updateCurrentStateName (nextStateName, nextResource, executionDescription) {
    const executionName = executionDescription.executionName

    await this.dao.updateCurrentStateName(
      nextStateName,
      nextResource,
      executionName
    )
    // TODO:Error needs handling as per spec
    this.stateMachine.processState(executionName)
  } // updateCurrentStateName

  noMatchingChoice (executionDescription) {
    const error = `No matching choice in ${executionDescription.executionName}.${executionDescription.currentStateName}`
    debugPackage(error)
    this.processTaskFailure(
      States.NoChoiceMatched.error(error),
      executionDescription.executionName
    )
  } // noMatchingChoice
} // class Choice

// asl-choice-processor validates the Choices when they're compiled, but its
// errors only say where in the Choices the problem is. Add the state machine
// and state names so the problem can be found.
function compileChoices (stateName, stateMachineName, stateDefinition) {
  try {
    return aslChoiceProcessor(stateDefinition)
  } catch (e) {
    const detail = e.message.replace(/^Invalid Choice state: /, '')
    const err = new Error(`Invalid Choice state '${stateName}' in state machine '${stateMachineName}': ${detail}`, { cause: e })
    err.name = e.name
    err.stateMachineName = stateMachineName
    err.stateName = stateName
    throw err
  }
} // compileChoices

module.exports = Choice
