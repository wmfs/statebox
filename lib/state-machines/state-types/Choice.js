'use strict'
const BaseStateType = require('./Base-state')
const aslChoiceProcessor = require('@wmfs/asl-choice-processor')

class Choice extends BaseStateType {
  constructor (stateName, stateMachine, stateDefinition, options) {
    super(stateName, stateMachine, stateDefinition, options)
    this.stateType = 'Choice'
    this.states = stateMachine.states
    this.calculateNextState = aslChoiceProcessor(stateDefinition)
    this.debug()
  }

  process (executionDescription, input) {
    const executionName = executionDescription.executionName
    const nextStateName = this.calculateNextState(input)
    const nextResource = this.states[nextStateName].definition.Resource
    this.updateCurrentStateName(nextStateName, nextResource, executionName)
  }

  async updateCurrentStateName (nextStateName, nextResource, executionName) {
    await this.dao.updateCurrentStateName(
      nextStateName,
      nextResource,
      executionName
    )
    // TODO:Error needs handling as per spec
    this.stateMachine.processState(executionName)
  } // updateCurrentStateName
}

module.exports = Choice
