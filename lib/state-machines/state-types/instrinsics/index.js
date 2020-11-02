const statesFormat = require('./format')
const Tokenizr = require('tokenizr')
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

function toString (str) { return str }
function toNumber (str) { return Number.parseFloat(str) }
function toBoolean (str) { return str === 'true' }

const lexer = new Tokenizr()
lexer.rule(/'((?:\\'|[^\r\n])*)'/, (ctx, match) => {
  ctx.accept('string', toString(match[1]))
})
lexer.rule(/[+-]?\d+\.?\d*/, (ctx, match) => {
  ctx.accept('number', toNumber(match[0]))
})
lexer.rule(/true|false/, (ctx, match) => {
  ctx.accept('boolean', toBoolean(match[0]))
})
lexer.rule(/null/, (ctx) => {
  ctx.accept('null', null)
})

function parseArguments (argString) {
  lexer.input(argString)
  const tokens = lexer.tokens()
  return tokens
    .filter(token => token.type !== 'EOF')
    .map(token => token.value)
} // parseArguments

module.exports = {
  format: statesFormat,
  isFunctionCall: isFunctionCall,
  parseFunctionCall: parseFunctionCall,
  parseArguments: parseArguments
}
