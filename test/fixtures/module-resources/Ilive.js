module.exports = class ILive {
  run (event, context) {
    context.sendTaskSuccess()
  }
}
