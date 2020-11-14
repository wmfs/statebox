'use strict'
const BaseStateType = require('./Base-state')
const cloneDeep = require('lodash/cloneDeep')

class Pass extends BaseStateType {
  constructor (stateName, stateMachine, stateDefinition, options) {
    super(stateName, stateMachine, stateDefinition, options)
    this.stateType = 'Pass'
    this.result = stateDefinition.Result
    this.debug()
  }

  process (executionDescription, input) {
    const result = this.result ? cloneDeep(this.result) : input

    this.processTaskSuccess(
      executionDescription.executionName,
      result
    )
  }
}

module.exports = Pass
