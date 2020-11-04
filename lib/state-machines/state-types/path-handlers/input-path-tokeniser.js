const Tokenizr = require('tokenizr')

const PARAMLIST = 'param-list'

const lexer = new Tokenizr()
lexer.rule(/^\$.*$/, (ctx, match) => {
  ctx.accept('path', match[0])
})
lexer.rule(/^States.(\w+)\(/, (ctx, match) => {
  ctx.push(PARAMLIST)
  ctx.accept('function', match[1])
})
lexer.rule(/\)/, (ctx) => {
  ctx.accept('end-function', null)
  ctx.pop()
})
lexer.rule(PARAMLIST, /\$[^, )]+/, (ctx, match) => {
  ctx.accept('path', match[0])
})
lexer.rule(PARAMLIST, /'((?:\\'|.)*?)'/, (ctx, match) => {
  ctx.accept('string', match[1])
})
lexer.rule(PARAMLIST, /[+-]?\d+\.?\d*/, (ctx, match) => {
  ctx.accept('number', match[0])
})
lexer.rule(PARAMLIST, /true|false/, (ctx, match) => {
  ctx.accept('boolean', match[0])
})
lexer.rule(PARAMLIST, /null/, ctx => ctx.accept('null'))
lexer.rule(PARAMLIST, / /, ctx => ctx.ignore())
lexer.rule(PARAMLIST, /,/, ctx => ctx.ignore())

function tokenizer (argString) {
  lexer.input(argString)

  return buildFunctionParameters(lexer.token(), lexer)
} // tokenizer

function * parameters (lexer) {
  let tok = lexer.token()
  while (tok.type !== 'end-function') {
    yield tok
    tok = lexer.token()
  }
}

function buildFunctionParameters (token, lexer) {
  if (token.type === 'function') {
    const params = []
    for (const t of parameters(lexer)) {
      params.push(buildFunctionParameters(t, lexer))
    }
    token.parameters = params
  }

  return token
} // buildFunctionParameters

module.exports = tokenizer
