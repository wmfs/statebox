module.exports = class C {
  run (event, context) {
    setTimeout(
      function () {
        context.sendTaskSuccess('C')
      },
      250
    )
  }
}
