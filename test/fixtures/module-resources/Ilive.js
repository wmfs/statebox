'use strict'

module.exports = class Hello {
  init (resourceConfig, env, callback) {
    callback(null)
  }

  run (event, context) {
    console.log('I LIVE!!!')
    context.sendTaskSuccess()
  }
}
