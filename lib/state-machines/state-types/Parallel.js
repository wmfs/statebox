'use strict'
const ParentBaseState = require('./Parent-base-state')
const States = require('./errors')

class Parallel extends ParentBaseState {
  constructor (stateName, stateMachine, stateDefinition, options) {
    super(stateName, stateMachine, stateDefinition, options)

    this.stateType = 'Parallel'
    this.branches = stateDefinition.Branches
      .map(branchDefinition => {
        const parts = stateMachine.name.split(':')
        const stateMachineName = parts[0] + ':' + branchDefinition.StartAt
        return stateMachineName
      })

    this.debug()
  } // constructor

  buildBranchExecutions (input, parentExecutionName) {
    return this.branches.map((stateMachineName, index) =>
      this.makeChildExecution(stateMachineName, input, index, parentExecutionName)
    )
  } // buildBranchExecutions

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
} // class Parallel

module.exports = Parallel
