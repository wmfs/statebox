const findSelector = require('./find-selector')
const payloadTemplateHandler = require('./payload-template-handler')

// See https://states-language.net/spec.html#filters
// A _Path === null is specified as being distinct from an undefined Path
// InputPath
function inputPathHandler (inputPath, parameters) {
  const path = findSelector(inputPath)
  const parameterTemplate = payloadTemplateHandler(parameters)

  return (input, executionContext) => parameterTemplate(path(input), executionContext)
} // inputPathHandler

module.exports = inputPathHandler
