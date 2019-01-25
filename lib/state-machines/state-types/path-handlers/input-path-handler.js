const _ = require('lodash')
const dottie = require('dottie')
const jp = require('jsonpath')
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

  const replacements = findReplacements(params)

  return replacements.length
    ? makeDynamicHandler(params, replacements)
    : makeFixedHandler(params)
} // parameterHandler

function findReplacements (params) {
  const paths = findSelectors(params)

  const replacements = paths.map(p => [p, dottie.get(params, p)])
  return replacements
} // findReferences

function findSelectors (params, path = [], selectors = []) {
  for (const [key, value] of Object.entries(params)) {
    if (isSelector(key)) {
      selectors.push([...path, key])
    } else if (typeof value === 'object') {
      findSelectors(value, [...path, key], selectors)
    }
  } // findSelectors

  return selectors
} // findSelectors

function isSelector (path) {
  return path.endsWith('.$')
} // isSelector

function makeDynamicHandler (params, references) {
  const skeleton = skeletonizeParams(params, references)
  const replacers = makeReplacers(references)

  return ctx => {
    const parameters = _.cloneDeep(skeleton)
    for (const [path, expr] of replacers) {
      const values = _.cloneDeep(jp.query(ctx, expr))
      if (values.length === 0) {
        throw {
          cause: 'States.ParameterPathFailure',
          error: `JSONPath ${expr} did not match an input node`
        }
      }

      const extractedValue = values.length === 1 ? values[0] : values
      dottie.set(parameters, path, extractedValue)
    }
    return parameters
  }
} // makeDynamicHandler

function makeReplacers(references) {
  return references.map(([path, expr]) => {
    const lastIndex = path.length - 1
    const lastPath = path[lastIndex]
    const replacePath = [...path]
    replacePath[lastIndex] = lastPath.substring(0, lastPath.length - 2)
    return [replacePath, expr]
  })
} // makeReplacers

function skeletonizeParams (params, references) {
  for (const path of references.map(r => r[0])) {
    const parentPath = path.slice(0, path.length - 1)
    const key = path[path.length - 1]

    const parent = dottie.get(params, parentPath)
    delete parent[key]
  }
  return params
} // skeletonizeParams

function makeFixedHandler (params) {
  return () => params
} // makeFixedHandler

module.exports = inputPathHandler
