module.exports = class Add {
  run (input, context) {
    const [x,y] = input
    console.log(`${x} + ${y} = ${x + y}`)
    context.sendTaskSuccess(x + y)
  }
}