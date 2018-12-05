'use strict'

const Status = require('./Status')
const merge = require('deepmerge')

module.exports = class ParallelBranchTracker {
  constructor () {
    this.parentExecutions = {}
    this.childExecutions = {}
  }

  addParentExecutionName (parentExecutionName) {
    this.parentExecutions[parentExecutionName] = {
      running: 0,
      children: {},
      ctx: []
    }
  }

  addChildExecutionName (parentExecutionName, childExecutionName) {
    this.childExecutions[childExecutionName] = parentExecutionName
    this.parentExecutions[parentExecutionName].children[childExecutionName] = this.parentExecutions[parentExecutionName].running
    this.parentExecutions[parentExecutionName].running++
  }

  registerChildExecutionEnd (childExecutionName, ctx) {
    const parentExecutionName = this.childExecutions[childExecutionName]
    const parent = this.parentExecutions[parentExecutionName]

    const childIndex = parent.children[childExecutionName]
    parent.ctx[childIndex] = ctx

    parent.running--
  }

  registerChildExecutionFail (childExecutionName) {
    // TODO: Garbage collect
  }

  getParallelTaskStatus (parentExecutionName) {
    const parent = this.parentExecutions[parentExecutionName]
    return (parent.running === 0) ? Status.SUCCEEDED : Status.RUNNING
  }

  ctx (parentExecutionName) {
    return this.parentExecutions[parentExecutionName].ctx
  }
}
