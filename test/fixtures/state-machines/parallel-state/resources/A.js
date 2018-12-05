module.exports = class A {
  run (event, context) {
    setTimeout(
      function () {
        console.log('A')
        context.sendTaskSuccess('A')
      },
      500
    )
  }
}
