const axios = require('axios')

module.exports = class Failure {
  run (event, context) {
    axios.get('http://localhost:9999/please-just-fail')
      .catch(err => context.sendTaskFailure(err))
  } // run
}
