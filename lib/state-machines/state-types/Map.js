'use strict'
const BaseStateType = require('./Base-state')
const jp = require('jsonpath')

class Map extends BaseStateType {
  constructor (stateName, stateMachine, stateDefinition, options) {
    super(stateName, stateMachine, stateDefinition, options)
    this.stateType = 'Map'

    this.options = options
    this.executioner = options.executioner
    this.itemsPath = stateDefinition.ItemsPath
    this.iterator = stateMachine.name.split(':')[0] + ':' + stateDefinition.Iterator.StartAt
    // todo: MaxConcurrency
  }

  async process (executionDescription, input) {
    const parentExecutionName = executionDescription.executionName

    const arrToIterate = jp.value(input, this.itemsPath)
    executionDescription.childCount = arrToIterate.length
    await this.dao.checkpoint(executionDescription)

    const iterations = arrToIterate.map((item, idx) => {
      return this.executioner(
        item,
        this.iterator,
        {
          branchIndex: idx,
          parentExecutionName,
          parentStateMachineName: this.stateMachineName,
          parentStateName: this.name
        },
        this.options
      )
    })

    Promise
      .all(iterations)
      .then(data => data.map(d => d.ctx))
      .catch(err => { throw new Error(err) }) // TODO: Needs proper handling
  }
}

module.exports = Map
