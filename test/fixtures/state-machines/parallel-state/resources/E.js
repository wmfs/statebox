module.exports = class E {
  run (event, context) {
    console.log('E')
    context.sendTaskSuccess('E')
  }
}
