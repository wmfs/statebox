module.exports = class Add {
  run (input, context) {
    const [x, y] = input
    context.sendTaskSuccess(x + y)
  }
}
