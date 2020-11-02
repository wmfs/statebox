const statesFormat = require('./format')

const callPattern = /^States\.(Format|StringToJson|JsonToString|Array)\(.*\)$/

function isFunctionCall (call) {
  return callPattern.test(call)
} // isFunctionCall

module.exports = {
  format: statesFormat,
  isFunctionCall: isFunctionCall
}
