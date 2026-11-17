/*
  States.UUID(), see https://states-language.net/#appendix-b

  Takes no arguments and returns a version 4 UUID string.
*/
const crypto = require('crypto')
const V = require('./validation')

function uuid () {
  return crypto.randomUUID()
}
uuid.validate = (tokens, values) => {
  V.argCount('UUID', values, 0)
}

module.exports = uuid
