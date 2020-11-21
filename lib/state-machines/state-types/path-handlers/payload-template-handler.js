const _ = require('lodash')
const dottie = require('dottie')
const jp = require('jsonpath')
const argTokeniser = require('./input-path-tokeniser')
const instrinsics = require('../instrinsics')
const ErrorStates = require('../errors')

function payloadTemplateHandler (parameters) {
  if (!parameters) return passthroughHandler

  const params = _.cloneDeep(parameters)

  const replacements = findReplacements(params)

  return replacements.length
    ? makeDynamicHandler(params, replacements)
    : makeFixedHandler(params)
} // payloadTemplateHandler

function passthroughHandler (input) {
  return input
} // passthroughHandler

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

  return input => {
    const parameters = _.cloneDeep(skeleton)
    for (const [path, expr] of replacers) {
      const extractedValue = evaluateExpression(expr, input)

      dottie.set(parameters, path, extractedValue)
    }
    return parameters
  }
} // makeDynamicHandler

const Evaluate = {
  path: evaluatePath,
  function: evaluateIntrinsic,
  string: token => token.value,
  number: token => Number.parseFloat(token.value),
  boolean: token => (token.value === 'true'),
  null: () => null
} // Evaluate

function evaluateExpression (expression, input) {
  const token = argTokeniser(expression)
  return evaluateArgument(token, input)
} // evaluateExpression

function evaluateArgument (token, input) {
  return Evaluate[token.type](token, input)
} // evaluateArgument

function evaluatePath ({ value }, input) {
  return extractValue(_.cloneDeep(jp.query(input, value)))
} // evaluatePath

function evaluateIntrinsic (func, input) {
  const fn = instrinsics[func.value]
  if (!fn) {
    ErrorStates.IntrinsicFailure.raise(`Unknown intrinsic States.${func.value}`)
  }

  try {
    const values = func.parameters.map(token => evaluateArgument(token, input))

    if (fn.validate) {
      fn.validate(func.parameters, values)
    }

    return fn(...values)
  } catch (e) {
    ErrorStates.IntrinsicFailure.raise(e.message)
  }
} // evaluateInstrinsic

function extractValue (values) {
  switch (values.length) {
    case 0:
      // States.ParameterPathFailure.raise(`JSONPath ${expr} did not match an input node`)
      return null
    case 1:
      return values[0]
    default:
      return values
  }
} // extractValue

function makeReplacers (references) {
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

module.exports = payloadTemplateHandler
