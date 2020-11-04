const _ = require('lodash')
const jp = require('jsonpath')
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
lexer.rule(/\$[^ ,]+/, (ctx, match) => {
  // this regex is too simple, but is sufficient here
  // see https://github.com/wmfs/j2119/blob/master/lib/j2119/json_path_checker.js
  // for the complete mouthful of a regex a path needs
  ctx.accept('path', match[0])
})
lexer.rule(/'((?:\\'|.)*?)'/, (ctx, match) => {
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
  path: (expr, context) => extractValue(_.cloneDeep(jp.query(context, expr))),
  string: str => str,
  number: str => Number.parseFloat(str),
  boolean: str => (str === 'true'),
  null: () => null
}

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
}

function parseArguments (argString, context) {
  lexer.input(argString)
  const tokens = lexer.tokens()
  return tokens
    .filter(token => token.type !== 'EOF')
    .map(token => Conversion[token.type](token.value, context))
} // parseArguments

module.exports = {
  format: statesFormat,
  isFunctionCall: isFunctionCall,
  parseFunctionCall: parseFunctionCall,
  parseArguments: parseArguments
}
