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

const lexer = new Tokenizr()
lexer.rule(/'((?:\\'|[^\r\n])*?)'/, (ctx, match) => {
  ctx.accept('string', match[1])
})
lexer.rule(/[+-]?\d+\.?\d*/, (ctx, match) => {
  ctx.accept('number', match[0])
})
lexer.rule(/true|false/, (ctx, match) => {
  ctx.accept('boolean', match[0])
})
lexer.rule(/null/, (ctx) => {
  ctx.accept('null')
})
lexer.rule(/ /, (ctx) => {
  ctx.ignore()
})
lexer.rule(/,/, (ctx) => {
  ctx.ignore()
})

const Conversion = {
  string: str => str,
  number: str => Number.parseFloat(str),
  boolean: str => (str === 'true'),
  null: () => null
}

function parseArguments (argString) {
  lexer.input(argString)
  const tokens = lexer.tokens()
  return tokens
    .filter(token => token.type !== 'EOF')
    .map(token => Conversion[token.type](token.value))
} // parseArguments

module.exports = {
  format: statesFormat,
  isFunctionCall: isFunctionCall,
  parseFunctionCall: parseFunctionCall,
  parseArguments: parseArguments
}
