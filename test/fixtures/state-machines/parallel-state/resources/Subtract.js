module.exports = class Subtract {
  run (input, context) {
    const [x,y] = input
    console.log(`${x} - ${y} = ${x - y}`)
    context.sendTaskSuccess(x - y)
  }
}
