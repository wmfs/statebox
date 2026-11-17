/*
  Data encoding and decoding intrinsic functions, see https://states-language.net/#appendix-b

  States.Base64Encode(string)
    Base64 encoding of the (UTF-8) string. Input MUST be 10000 characters or fewer.
      States.Base64Encode('Data to encode') => 'RGF0YSB0byBlbmNvZGU='

  States.Base64Decode(string)
    Decodes base64 back to a (UTF-8) string. Input MUST be 10000 characters or fewer.
      States.Base64Decode('RGF0YSB0byBlbmNvZGU=') => 'Data to encode'

  States.Hash(data, algorithm)
    Hex encoded hash of data. data MUST be a string of 10000 characters or fewer.
    algorithm MUST be one of MD5, SHA-1, SHA-256, SHA-384, SHA-512.
      States.Hash('input data', 'SHA-1') => 'aaff4a450a104cd177d28d18d74485e8cae074b7'
*/
const crypto = require('crypto')
const V = require('./validation')

const BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/

const HASH_ALGORITHMS = {
  MD5: 'md5',
  'SHA-1': 'sha1',
  'SHA-256': 'sha256',
  'SHA-384': 'sha384',
  'SHA-512': 'sha512'
}

function base64Encode (str) {
  return Buffer.from(str, 'utf8').toString('base64')
}
base64Encode.validate = (tokens, values) => {
  V.argCount('Base64Encode', values, 1)
  V.isString('Base64Encode', values[0], 1, V.MAX_STRING_LENGTH)
}

function base64Decode (str) {
  return Buffer.from(str, 'base64').toString('utf8')
}
base64Decode.validate = (tokens, values) => {
  V.argCount('Base64Decode', values, 1)
  V.isString('Base64Decode', values[0], 1, V.MAX_STRING_LENGTH)
  if (!BASE64.test(values[0])) {
    throw Error('States.Base64Decode argument 1 is not valid base64')
  }
}

function hash (data, algorithm) {
  return crypto.createHash(HASH_ALGORITHMS[algorithm]).update(data, 'utf8').digest('hex')
}
hash.validate = (tokens, values) => {
  V.argCount('Hash', values, 2)
  V.isString('Hash', values[0], 1, V.MAX_STRING_LENGTH)
  V.isString('Hash', values[1], 2)
  if (!Object.hasOwn(HASH_ALGORITHMS, values[1])) {
    throw Error(`States.Hash algorithm must be one of ${Object.keys(HASH_ALGORITHMS).join(', ')}, got '${values[1]}'`)
  }
}

module.exports = {
  Base64Encode: base64Encode,
  Base64Decode: base64Decode,
  Hash: hash
}
