'use strict'
const BaseStateType = require('./Base-state')
const _ = require('lodash')

class Pass extends BaseStateType {
  constructor (stateName, stateMachine, stateDefinition, options) {
    super(stateName, stateMachine, stateDefinition, options)
    this.stateType = 'Pass'
    this.result = stateDefinition.Result
    this.debug()
  }

  process (executionDescription) {
    const result = this.result ? _.cloneDeep(this.result) : this.inputSelector(executionDescription.ctx)

    this.processTaskSuccess(
      executionDescription.executionName,
      result
    )
  }
}

module.exports = Pass
