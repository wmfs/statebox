const statesFormat = require('./format')
const statesArray = require('./array')
const statesStringToJson = require('./stringToJson')
const statesJsonToString = require('./jsonToString')

module.exports = {
  Format: statesFormat,
  Array: statesArray,
  StringToJson: statesStringToJson,
  JsonToString: statesJsonToString
}
