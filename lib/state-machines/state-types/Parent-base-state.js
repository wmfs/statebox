const BaseStateType = require('./Base-state')
const cloneDeep = require('lodash/cloneDeep')
const States = require('./errors')

class ParentBaseState extends BaseStateType {
  constructor (stateName, stateMachine, stateDefinition, options) {
    super(stateName, stateMachine, stateDefinition, options)
    this.options = options
    this.startExecution = options.startExecution
  } // constructor

  makeChildExecution (
    stateMachineName,
    input,
    index,
    parentExecutionName
  ) {
    const branchContext = cloneDeep(input)

    return this.startExecution(
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
  } // makeChildExecution

  async process (executionDescription, input) {
    const parentExecutionName = executionDescription.executionName
    await this.dao.checkpoint(executionDescription)

    const branchExecutions = this.buildBranchExecutions(input, parentExecutionName)

    Promise
      .all(branchExecutions)
      .then(() => this.handleChildExecutionComplete(
        parentExecutionName,
        this.stateMachineName,
        this.name
      ))
      .catch(err => {
        this.processTaskFailure(
          States.BranchFailed.error(err.toString()),
          parentExecutionName.executionName
        )
      })
  } // process
} // class ParentBaseState

module.exports = ParentBaseState
