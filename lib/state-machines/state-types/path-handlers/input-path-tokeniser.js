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
  ctx.pop()
  ctx.ignore()
})
lexer.rule(PARAMLIST, /\$[^ ,]+/, (ctx, match) => {
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
  const tokens = lexer.tokens().filter(token => token.type !== 'EOF')
  return tokens[0] // should be the only token
}

module.exports = tokenizer
