const ParentBaseState = require('./Parent-base-state')
const jp = require('jsonpath')

class Map extends ParentBaseState {
  constructor (stateName, stateMachine, stateDefinition, options) {
    super(stateName, stateMachine, stateDefinition, options)
    this.stateType = 'Map'
    this.itemsPath = stateDefinition.ItemsPath
    this.iterator = stateMachine.name.split(':')[0] + ':' + stateDefinition.Iterator.StartAt
    // todo: MaxConcurrency
  }

  buildBranchExecutions (input, parentExecutionName, executionOptions) {
    const branches = jp.value(input, this.itemsPath)
    return branches.map((item, index) =>
      this.makeChildExecution(this.iterator, item, index, parentExecutionName, executionOptions)
    )
  } // buildBranchExecutions
} // class Map

module.exports = Map
