'use strict'

module.exports = class Failure {
  init (resourceConfig, env, callback) {
    callback(null)
  }

  run (event, context) {
    const obj = { }
    try {
      obj.missingFn()
    } catch (err) {
      context.sendTaskFailure(err)
    }
  } // run
}
