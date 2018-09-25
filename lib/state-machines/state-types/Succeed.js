'use strict'
const BaseStateType = require('./Base-state')

class Succeed extends BaseStateType {
  constructor (stateName, stateMachine, stateDefinition, options) {
    super(stateName, stateMachine, stateDefinition, options)
    this.stateType = 'Succeed'
    this.debug()
  }

  process (executionDescription) {
    this.processTaskSuccess(
      executionDescription.executionName,
      null
    )
  }

}

module.exports = Succeed
