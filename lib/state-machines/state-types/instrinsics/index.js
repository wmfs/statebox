const statesFormat = require('./format')
const statesArray = require('./array')
const statesStringToJson = require('./stringToJson')
const statesJsonToString = require('./jsonToString')
const arrayFunctions = require('./arrayFunctions')
const encodingFunctions = require('./encodingFunctions')
const mathFunctions = require('./mathFunctions')
const statesJsonMerge = require('./jsonMerge')
const statesStringSplit = require('./stringSplit')
const statesUuid = require('./uuid')

// Keyed by the name following "States." - see https://states-language.net/#appendix-b
module.exports = {
  // Intrinsics for JSON construction
  Format: statesFormat,
  StringToJson: statesStringToJson,
  JsonToString: statesJsonToString,
  // Intrinsics for arrays
  Array: statesArray,
  ...arrayFunctions,
  // Intrinsics for data encoding and decoding
  ...encodingFunctions,
  // Intrinsics for JSON data manipulation
  JsonMerge: statesJsonMerge,
  // Intrinsics for math operations
  ...mathFunctions,
  // Intrinsics for string operations
  StringSplit: statesStringSplit,
  // Intrinsics for unique identifier generation
  UUID: statesUuid
}
