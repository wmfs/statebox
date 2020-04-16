const axios = require('axios')

module.exports = class HttpNotFound {
  run (event, context) {
    axios.get('http://localhost:3003/not-found')
      .catch(err => context.sendTaskFailure(err))
  } // run
}
