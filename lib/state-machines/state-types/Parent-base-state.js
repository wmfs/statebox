const BaseStateType = require('./Base-state')

class ParentBaseState extends BaseStateType {
  constructor (stateName, stateMachine, stateDefinition, options) {
    super(stateName, stateMachine, stateDefinition, options)
    this.options = options
    this.executioner = options.executioner
  } // constructor

  async process (executionDescription, input) {

  }
} // class ParentBaseState

module.exports = ParentBaseState
