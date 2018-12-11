'use strict'
const cloneDeep = require('lodash/cloneDeep')
const BaseStateType = require('./Base-state')

class Parallel extends BaseStateType {
  constructor (stateName, stateMachine, stateDefinition, options) {
    super(stateName, stateMachine, stateDefinition, options)

    this.options = options
    this.executioner = options.executioner
    this.stateType = 'Parallel'
    this.branches = stateDefinition.Branches
      .map(branchDefinition => {
        const parts = stateMachine.name.split(':')
        const stateMachineName = parts[0] + ':' + branchDefinition.StartAt
        return stateMachineName
      })

    this.debug()
  } // constructor

  async process (executionDescription, input) {
    const parentExecutionName = executionDescription.executionName

    await this.parallelBranchTracker.addParentExecution(executionDescription, this.branches.length)

    const branchExecutions = this.branches
      .map((stateMachineName, index) => {
        const branchContext = cloneDeep(input)
        return this.executioner(
          branchContext,
          stateMachineName,
          {
            branchIndex: index,
            parentExecutionName: parentExecutionName
          },
          this.options
        )
      })

    Promise.all(branchExecutions)
      .catch(err => { throw new Error(err) }) // TODO: Needs proper handling
  } // process
} // class Parallel

module.exports = Parallel
