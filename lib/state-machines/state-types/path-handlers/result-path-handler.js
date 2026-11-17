const _ = require('lodash')
const dottie = require('dottie')
const payloadTemplateHandler = require('./payload-template-handler')

// ResultPath
function findResultPathHandler (resultPath, resultSelector) {
  const handler = resultPathHandler(resultPath)
  const selector = payloadTemplateHandler(resultSelector)

  return (ctx, result) => handler(ctx, selector(result))
} // findResultPathHandler

function resultPathHandler (resultPath) {
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
  // Only skip when there's no result at all - falsy results such as
  // 0, false, '' and null are real values and must be written (issue #406)
  if (result !== undefined) {
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
