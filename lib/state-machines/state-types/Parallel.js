const ParentBaseState = require('./Parent-base-state')

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

  buildBranchExecutions (input, parentExecutionName, executionOptions) {
    return this.branches.map((stateMachineName, index) =>
      this.makeChildExecution(stateMachineName, input, index, parentExecutionName, executionOptions)
    )
  } // buildBranchExecutions
} // class Parallel

module.exports = Parallel
