module.exports = class D {
  run (event, context) {
    console.log('D')
    context.sendTaskSuccess('D')
  }
}
