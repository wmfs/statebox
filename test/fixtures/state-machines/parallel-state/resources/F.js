module.exports = class F {
  run (event, context) {
    console.log('F')
    context.sendTaskSuccess('F')
  }
}
