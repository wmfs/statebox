'use strict'
const _ = require('lodash')
module.exports = function convertJsonpathToDottie (jsonpath) {
  let dottiePath = jsonpath

  if (dottiePath.length > 0) {
    if (dottiePath[0] === '$') {
      dottiePath = dottiePath.slice(1)
    }
  }
  if (dottiePath.length > 0) {
    if (dottiePath[0] === '.') {
      dottiePath = dottiePath.slice(1)
    }
  }

  return dottiePath
}
