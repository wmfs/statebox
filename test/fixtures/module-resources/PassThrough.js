module.exports = class PassThrough {
  run (event, context) {
    context.sendTaskSuccess(event)
  }
}
