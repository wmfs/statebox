'use strict'

module.exports = class Failure {
  init (resourceConfig, env) {
  }

  run (event, context) {
    // generate an exception
    const hello = null
    try {
      hello.oh_dear()
    } catch (err) {
      context.sendTaskFailure(
        {
          error: 'ExceptionHandler',
          cause: err
        }
      )
    }
  } // run
}
