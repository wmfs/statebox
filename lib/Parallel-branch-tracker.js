'use strict'

const Status = require('./Status')
const merge = require('deepmerge')

module.exports = class ParallelBranchTracker {
  constructor () {
    this.parentExecutions = {}
    this.childExecutions = {}
  }

  addToCtx (parentExecutionName, ctx) {
    this.parentExecutions[parentExecutionName].ctx =
      merge(this.parentExecutions[parentExecutionName].ctx, ctx)

    console.log(`ctx -> ${JSON.stringify(this.parentExecutions[parentExecutionName].ctx)}`)
  }

  addParentExecutionName (parentExecutionName) {
    this.parentExecutions[parentExecutionName] = {
      running: 0,
      ctx: { }
    }
  }

  addChildExecutionName (parentExecutionName, childExecutionName) {
    this.childExecutions[childExecutionName] = parentExecutionName
    this.parentExecutions[parentExecutionName].running++
  }

  registerChildExecutionEnd (childExecutionName) {
    const parentExecutionName = this.childExecutions[childExecutionName]
    const parent = this.parentExecutions[parentExecutionName]
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
