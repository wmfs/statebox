module.exports = class D {
  run (event, context) {
    context.sendTaskSuccess('D')
  }
}
