/*
  Array intrinsic functions, see https://states-language.net/#appendix-b

  States.ArrayPartition(array, chunkSize)
    Splits array into chunks of chunkSize items. chunkSize MUST be a positive
    integer. The final chunk may hold fewer items.
      States.ArrayPartition([1,2,3,4,5,6,7,8,9], 4) => [[1,2,3,4],[5,6,7,8],[9]]

  States.ArrayContains(array, value)
    true if value is in array (deep JSON equality), otherwise false.

  States.ArrayRange(first, last, step)
    Array of integers from first to last (inclusive) in increments of step.
    All arguments MUST be integers, step MUST NOT be 0, and the result MUST NOT
    hold more than 1000 items.
      States.ArrayRange(1, 9, 2) => [1,3,5,7,9]

  States.ArrayGetItem(array, index)
    The item at the zero-based index.
      States.ArrayGetItem([1,2,3,4,5,6,7,8,9], 5) => 6

  States.ArrayLength(array)
    Number of items in array.

  States.ArrayUnique(array)
    array with duplicates removed (deep JSON equality), first occurrences kept
    in their original order.
      States.ArrayUnique([1,2,3,3,3,3,3,3,4]) => [1,2,3,4]
*/
const isEqual = require('lodash/isEqual')
const uniqWith = require('lodash/uniqWith')
const V = require('./validation')

// ArrayPartition
function arrayPartition (array, chunkSize) {
  const chunks = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}
arrayPartition.validate = (tokens, values) => {
  V.argCount('ArrayPartition', values, 2)
  V.isArray('ArrayPartition', values[0], 1)
  V.isInteger('ArrayPartition', values[1], 2, { min: 1 })
}

// ArrayContains
function arrayContains (array, value) {
  return array.some(item => isEqual(item, value))
}
arrayContains.validate = (tokens, values) => {
  V.argCount('ArrayContains', values, 2)
  V.isArray('ArrayContains', values[0], 1)
}

// ArrayRange
function arrayRange (first, last, step) {
  const range = []
  if (step > 0) {
    for (let i = first; i <= last; i += step) range.push(i)
  } else {
    for (let i = first; i >= last; i += step) range.push(i)
  }
  return range
}
arrayRange.validate = (tokens, values) => {
  V.argCount('ArrayRange', values, 3)
  values.forEach((v, i) => V.isInteger('ArrayRange', v, i + 1))
  const [first, last, step] = values
  if (step === 0) {
    throw Error('States.ArrayRange step must not be 0')
  }
  const size = Math.max(0, Math.floor((last - first) / step) + 1)
  if (size > V.MAX_ARRAY_RANGE) {
    throw Error(`States.ArrayRange would generate ${size} items, the maximum is ${V.MAX_ARRAY_RANGE}`)
  }
}

// ArrayGetItem
function arrayGetItem (array, index) {
  return array[index]
}
arrayGetItem.validate = (tokens, values) => {
  V.argCount('ArrayGetItem', values, 2)
  V.isArray('ArrayGetItem', values[0], 1)
  V.isInteger('ArrayGetItem', values[1], 2, { min: 0 })
  if (values[1] >= values[0].length) {
    throw Error(`States.ArrayGetItem index ${values[1]} is out of bounds for array of length ${values[0].length}`)
  }
}

// ArrayLength
function arrayLength (array) {
  return array.length
}
arrayLength.validate = (tokens, values) => {
  V.argCount('ArrayLength', values, 1)
  V.isArray('ArrayLength', values[0], 1)
}

// ArrayUnique
function arrayUnique (array) {
  return uniqWith(array, isEqual)
}
arrayUnique.validate = (tokens, values) => {
  V.argCount('ArrayUnique', values, 1)
  V.isArray('ArrayUnique', values[0], 1)
}

module.exports = {
  ArrayPartition: arrayPartition,
  ArrayContains: arrayContains,
  ArrayRange: arrayRange,
  ArrayGetItem: arrayGetItem,
  ArrayLength: arrayLength,
  ArrayUnique: arrayUnique
}
