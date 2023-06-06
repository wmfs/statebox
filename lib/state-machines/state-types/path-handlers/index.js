const findInputPathHandler = require('./input-path-handler')
const findResultPathHandler = require('./result-path-handler')
const findOutputPathHandler = require('./find-selector')

module.exports = {
  Input: findInputPathHandler,
  Result: findResultPathHandler,
  Output: findOutputPathHandler
}
