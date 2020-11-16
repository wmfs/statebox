module.exports = class IncrementQuantity {
  run (event, context) {
    event.quantity++
    context.sendTaskSuccess(event)
  }
}
