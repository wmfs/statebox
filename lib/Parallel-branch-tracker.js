const Status = require('./Status')

module.exports = class ParallelBranchTracker {
  constructor (dao) {
    this.dao = dao
  }

  async addParentExecution (parentExecution, childBranchCount) {
    parentExecution.childCount = childBranchCount
    await this.dao.checkpoint(parentExecution)
  } // addParentExecution

  async registerChildExecutionEnd (childExecution, ctx) {
    const parentExecutionName = childExecution.executionOptions.parentExecutionName

    const allChildren = await this.dao.findExecutionsByParentName(parentExecutionName)
    const completedCount = allChildren.filter(child => child.status !== Status.RUNNING).length
    const failedCount = allChildren.filter(child => child.status === Status.FAILED).length

    const complete = (completedCount === allChildren.length) && (failedCount === 0)

    return [
      complete,
      complete ? makeParentContext(allChildren) : null
    ]
  } // registerChildExecutionEnd

  registerChildExecutionFail (childExecutionName) {
    // TODO: Garbage collect
  }
}

function makeParentContext (allChildren) {
  const ctx = [ ]
  for (const child of allChildren) {
    const branchIndex = child.executionOptions.branchIndex
    const childCtx = child.ctx

    ctx[branchIndex] = childCtx
  }
  return ctx
}
