module.exports = class A {
  run (event, context) {
    setTimeout(
      function () {
        context.sendTaskSuccess('A')
      },
      500
    )
  }
}
