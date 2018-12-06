let fail = false

module.exports = class Stuttery {
  run (event, context) {
    fail = !fail
    if (fail) {
      context.sendTaskFailure(
        {
          error: 'SomethingBadHappened',
          cause: 'But at least it was expected'
        }
      )
    } else {
      context.sendTaskSuccess({})
    }
  }
}
