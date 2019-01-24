
const findInputPathHandler = require('./input-path-handler')
const findResultPathHandler = require('./result-path-handler')
const findOutputPathHandler = require('./output-path-handler')

module.exports = {
  Input: findInputPathHandler,
  Result: findResultPathHandler,
  Output: findOutputPathHandler
}
