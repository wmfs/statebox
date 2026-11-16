const axios = require('axios')

module.exports = class HttpCantConnect {
  run (event, context) {
    axios.get('http://127.0.0.1:9999/please-just-fail')
      .catch(err => context.sendTaskFailure(err))
  } // run
}
