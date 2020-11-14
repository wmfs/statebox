const BaseStateType = require('./Base-state')
const cloneDeep = require('lodash/cloneDeep')

class ParentBaseState extends BaseStateType {
  constructor (stateName, stateMachine, stateDefinition, options) {
    super(stateName, stateMachine, stateDefinition, options)
    this.options = options
    this.executioner = options.executioner
  } // constructor

  makeChildExecution (
    stateMachineName,
    input,
    index,
    parentExecutionName
  ) {
    const branchContext = cloneDeep(input)

    return this.executioner(
      branchContext,
      stateMachineName,
      {
        branchIndex: index,
        parentExecutionName,
        parentStateMachineName: this.stateMachineName,
        parentStateName: this.name,
        sendResponse: 'COMPLETED'
      },
      this.options
    )
  }

  async process (executionDescription, input) {

  }
} // class ParentBaseState

module.exports = ParentBaseState
