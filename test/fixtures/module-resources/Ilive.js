module.exports = class Hello {
  run (event, context) {
    context.sendTaskSuccess()
  }
}
