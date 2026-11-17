// Shared argument checks for the intrinsic functions.
// Each throws a plain Error; the payload template handler converts
// any thrown error into a States.IntrinsicFailure.

const INT32_MIN = -2147483648
const INT32_MAX = 2147483647
const MAX_STRING_LENGTH = 10000
const MAX_ARRAY_RANGE = 1000

function typeName (value) {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
} // typeName

function argCount (fnName, values, min, max = min) {
  const n = values.length
  if (n < min || n > max) {
    const wanted = (min === max) ? `${min}` : `${min} to ${max}`
    throw Error(`States.${fnName} passed ${n} argument${n === 1 ? '' : 's'}, expects ${wanted}`)
  }
} // argCount

function isArray (fnName, value, position) {
  if (!Array.isArray(value)) {
    throw Error(`States.${fnName} argument ${position} must be an array, got ${typeName(value)}`)
  }
} // isArray

function isString (fnName, value, position, maxLength) {
  if (typeof value !== 'string') {
    throw Error(`States.${fnName} argument ${position} must be a string, got ${typeName(value)}`)
  }
  if (maxLength !== undefined && value.length > maxLength) {
    throw Error(`States.${fnName} argument ${position} must be ${maxLength} characters or fewer, got ${value.length}`)
  }
} // isString

function isObject (fnName, value, position) {
  if (typeName(value) !== 'object') {
    throw Error(`States.${fnName} argument ${position} must be a JSON object, got ${typeName(value)}`)
  }
} // isObject

function isBoolean (fnName, value, position) {
  if (typeof value !== 'boolean') {
    throw Error(`States.${fnName} argument ${position} must be a boolean, got ${typeName(value)}`)
  }
} // isBoolean

function isInteger (fnName, value, position, { min = INT32_MIN, max = INT32_MAX } = {}) {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw Error(`States.${fnName} argument ${position} must be an integer, got ${JSON.stringify(value)}`)
  }
  if (value < min || value > max) {
    throw Error(`States.${fnName} argument ${position} must be between ${min} and ${max}, got ${value}`)
  }
} // isInteger

module.exports = {
  INT32_MIN,
  INT32_MAX,
  MAX_STRING_LENGTH,
  MAX_ARRAY_RANGE,
  typeName,
  argCount,
  isArray,
  isString,
  isObject,
  isBoolean,
  isInteger
}
