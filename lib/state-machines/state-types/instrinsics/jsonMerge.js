/*
  States.JsonMerge(object1, object2, isDeep), see https://states-language.net/#appendix-b

  Merges two JSON objects. Where both have the same key, the value from object2 wins.
  Only shallow merging is defined, so isDeep MUST be the boolean false.

    States.JsonMerge({"a": {"a1": 1, "a2": 2}, "b": 2}, {"a": {"a3": 1, "a4": 2}, "c": 3}, false)
      => {"a": {"a3": 1, "a4": 2}, "b": 2, "c": 3}
*/
const V = require('./validation')

function jsonMerge (object1, object2) {
  return { ...object1, ...object2 }
}
jsonMerge.validate = (tokens, values) => {
  V.argCount('JsonMerge', values, 3)
  V.isObject('JsonMerge', values[0], 1)
  V.isObject('JsonMerge', values[1], 2)
  V.isBoolean('JsonMerge', values[2], 3)
  if (values[2] !== false) {
    throw Error('States.JsonMerge only supports shallow merging, argument 3 must be false')
  }
}

module.exports = jsonMerge
