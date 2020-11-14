'use strict'
const ParentBaseState = require('./Parent-base-state')
const jp = require('jsonpath')
const States = require('./errors')

class Map extends ParentBaseState {
  constructor (stateName, stateMachine, stateDefinition, options) {
    super(stateName, stateMachine, stateDefinition, options)
    this.stateType = 'Map'
    this.itemsPath = stateDefinition.ItemsPath
    this.iterator = stateMachine.name.split(':')[0] + ':' + stateDefinition.Iterator.StartAt
    // todo: MaxConcurrency
  }

  buildBranchExecutions (input, parentExecutionName) {
    const branches = jp.value(input, this.itemsPath)
    return branches.map((item, index) =>
      this.makeChildExecution(this.iterator, item, index, parentExecutionName)
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
  }
}

module.exports = Map
