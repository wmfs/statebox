// DoubleComplete.js: reports failure, then (wrongly) success
module.exports = class DoubleComplete {
  run (event, context) {
    context.sendTaskFailure({ error: 'FirstOutcome', cause: 'failure wins' })
    context.sendTaskSuccess({ shouldBe: 'ignored' })
  }
}
