'use strict'

const requestPromise = require('request-promise-native')

module.exports = class Failure {
  init (resourceConfig, env, callback) {
    callback(null)
  }

  run (event, context) {
    const rp = requestPromise.defaults()
    rp({
      uri: 'http://localhost:9999/please-just-fail'
    })
      .catch(err => context.sendTaskFailure(err))
  } // run
}
