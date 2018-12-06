module.exports = class B {
  run (event, context) {
    context.sendTaskSuccess('B')
  }
}
