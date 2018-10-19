'use strict'
const BaseStateType = require('./Base-state')

class Pass extends BaseStateType {
  constructor (stateName, stateMachine, stateDefinition, options) {
    super(stateName, stateMachine, stateDefinition, options)
    this.stateType = 'Pass'
    this.result = stateDefinition.Result
    this.debug()
  }

  process (executionDescription) {
    this.processTaskSuccess(
      executionDescription.executionName,
      this.result
    )
  }
}

module.exports = Pass
