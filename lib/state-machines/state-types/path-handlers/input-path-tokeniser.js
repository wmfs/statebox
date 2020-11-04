const Tokenizr = require('tokenizr')

const lexer = new Tokenizr()
lexer.rule(/^\$.*$/, (ctx, match) => {
  ctx.accept('path', match[0])
})

function tokenizer (argString) {
  lexer.input(argString)
  const tokens = lexer.tokens().filter(token => token.type !== 'EOF')
  return tokens[0] // should be the only token
}

module.exports = tokenizer
