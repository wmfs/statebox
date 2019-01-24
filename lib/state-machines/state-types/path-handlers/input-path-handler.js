const _ = require('lodash')
const findSelector = require('./find-selector')

// See https://states-language.net/spec.html#filters
// A _Path === null is specified as being distinct from an undefined Path
// InputPath
function inputPathHandler (inputPath, parameters) {
  if (!parameters) {
    return findSelector(inputPath)
  }

  return parameterHandler(parameters)
} // inputPathHandler

function parameterHandler (parameters) {
  const params = _.cloneDeep(parameters)
  return () => params
}

module.exports = inputPathHandler
