const _ = require('lodash')
const dottie = require('dottie')

// ResultPath
function findResultPathHandler (resultPath) {
  if (resultPath === null) {
    return nullResultPath
  }

  if (resultPath === undefined || resultPath === '$') {
    return defaultResultPath
  }

  const rp = convertJsonpathToDottie(resultPath)
  return (ctx, result) => applyResultPath(rp, ctx, result)
} // selectResultPathHolder

function nullResultPath (ctx) {
  return ctx
} // function nullResultPath

function defaultResultPath (ctx, result) {
  // TODO: THIS IS NOT THE CORRECT BEHAVIOUR, BUT CHANGING NOW WOULD BREAK EXISTING STATE MACHINES
  if (!result) return ctx

  if (!_.isObject(result)) return result

  return _.defaults(result, ctx)
  // return result
} // defaultResultPath

function applyResultPath (rp, ctx, result) {
  if (result) {
    dottie.set(ctx, rp, result)
  }
  return ctx
} // applyResultPath

function convertJsonpathToDottie (jsonpath) {
  let slice = 0
  if (jsonpath.length > 0 && jsonpath[0] === '$') {
    ++slice
  }
  if (jsonpath.length > slice && jsonpath[slice] === '.') {
    ++slice
  }

  const dottiePath = jsonpath.slice(slice)
  return dottiePath
} // convertJsonpathToDottie

module.exports = findResultPathHandler
