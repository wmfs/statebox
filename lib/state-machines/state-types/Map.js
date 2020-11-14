'use strict'
const cloneDeep = require('lodash/cloneDeep')
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

  async process (executionDescription, input) {
    const parentExecutionName = executionDescription.executionName

    const branches = jp.value(input, this.itemsPath)
    executionDescription.childCount = branches.length
    await this.dao.checkpoint(executionDescription)

    executionDescription.childCount = branches.length

    const branchExecutions = branches.map((item, index) => {
      const branchContext = cloneDeep(item)
      return this.executioner(
        branchContext,
        this.iterator,
        {
          branchIndex: index,
          parentExecutionName,
          parentStateMachineName: this.stateMachineName,
          parentStateName: this.name,
          sendResponse: 'COMPLETED'
        },
        this.options
      )
    })

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
