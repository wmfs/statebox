module.exports = class B {
  run (event, context) {
    console.log('B')
    context.sendTaskSuccess('B')
  }
}
