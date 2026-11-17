/*
  States.StringSplit(string, delimiters), see https://states-language.net/#appendix-b

  Splits string into an array of strings. Every character in delimiters is
  treated as a delimiter. Empty tokens are dropped.

    States.StringSplit('1,2,3,4,5', ',') => ["1","2","3","4","5"]
    States.StringSplit('This.is+a,test=string', '.+,=') => ["This","is","a","test","string"]
*/
const V = require('./validation')

function escapeRegExp (s) {
  return s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')
}

function stringSplit (str, delimiters) {
  if (delimiters.length === 0) return str.length ? [str] : []
  const splitter = new RegExp(`[${escapeRegExp(delimiters)}]`)
  return str.split(splitter).filter(token => token.length > 0)
}
stringSplit.validate = (tokens, values) => {
  V.argCount('StringSplit', values, 2)
  V.isString('StringSplit', values[0], 1)
  V.isString('StringSplit', values[1], 2)
}

module.exports = stringSplit
