'use strict'

module.exports = class Now {
  init (resourceConfig, env, callback) {
    callback(null)
  }

  run (event, context) {
    console.log(new Date().toISOString())
    context.sendTaskSuccess()
  }
}
