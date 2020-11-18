const cloneDeep = require('lodash/cloneDeep')
const jp = require('jsonpath')

function findSelector (path) {
  if (path === null) {
    return nullSelection
  }

  if (path === undefined || path === '$') {
    return defaultSelection
  }

  return ctx => selectPath(path, ctx)
} // findSelector

function nullSelection () {
  return { }
} // nullSelection

function defaultSelection (ctx) {
  return cloneDeep(ctx)
} // defaultSelection

function selectPath (path, ctx) {
  return cloneDeep(jp.value(ctx, path))
} // selectPath

module.exports = findSelector
