const Status = require('./Status')

module.exports = class ParallelBranchTracker {
  constructor (dao) {
    this.dao = dao
    this.parentExecutions = {}
    this.childExecutions = {}
  }

  async addParentExecution (parentExecution, childBranchCount) {
    parentExecution.executionOptions.childExecutions = {
      running: childBranchCount,
      ctx: []
    }
    await this.dao.checkpoint(parentExecution)

    this.parentExecutions[parentExecution.executionName] = {
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
