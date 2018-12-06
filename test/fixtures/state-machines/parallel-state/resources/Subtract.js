module.exports = class Subtract {
  run (input, context) {
    const [x, y] = input
    context.sendTaskSuccess(x - y)
  }
}
