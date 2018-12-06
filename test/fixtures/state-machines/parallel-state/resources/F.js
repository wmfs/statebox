module.exports = class F {
  run (event, context) {
    context.sendTaskSuccess('F')
  }
}
