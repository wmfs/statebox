module.exports = class ParallelBranchTracker {
  constructor (dao) {
    this.dao = dao
  }

  async addParentExecution (parentExecution, childBranchCount) {
    parentExecution.executionOptions.childExecutions = {
      running: childBranchCount,
      ctx: []
    }
    await this.dao.checkpoint(parentExecution)
  } // addParentExecution

  async registerChildExecutionEnd (childExecution, ctx) {
    const { parentExecutionName, branchIndex } = childExecution.executionOptions
    const parentExecution = await this.dao.findExecutionByName(parentExecutionName)
    const childExecutions = parentExecution.executionOptions.childExecutions
    childExecutions.ctx[branchIndex] = ctx
    childExecutions.running--
    await this.dao.checkpoint(parentExecution)

    return [
      childExecutions.running === 0,
      childExecutions.ctx
    ]
  } // registerChildExecutionEnd

  registerChildExecutionFail (childExecutionName) {
    // TODO: Garbage collect
  }
}
