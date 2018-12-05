module.exports = class C {
  run (event, context) {
    setTimeout(
      function () {
        console.log('C')
        context.sendTaskSuccess('C')
      },
      250
    )
  }
}
