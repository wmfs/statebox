const statesFormat = require('./format')

const callPattern = /^States\.(Format|StringToJson|JsonToString|Array)\(.*\)$/

function isFunctionCall (call) {
  return callPattern.test(call)
} // isFunctionCall

function parseFunctionCall (call) {
  const firstBracket = call.indexOf('(')
  return [
    call.substring(0, firstBracket),
    []
  ]
}

module.exports = {
  format: statesFormat,
  isFunctionCall: isFunctionCall,
  parseFunctionCall: parseFunctionCall
}
