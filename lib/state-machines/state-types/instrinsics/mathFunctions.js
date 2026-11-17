/*
  Math intrinsic functions, see https://states-language.net/#appendix-b

  States.MathRandom(start, end[, seed])
    A random integer n where start <= n < end. Arguments MUST be integers.
    If the optional integer seed is given, the same seed always gives the same result.

  States.MathAdd(value1, value2)
    value1 + value2. Arguments MUST be integers in the range -2147483648..2147483647.
      States.MathAdd(111, -1) => 110
*/
const V = require('./validation')

// mulberry32 - small, fast, deterministic PRNG for seeded calls
function seededRandom (seed) {
  let t = (seed + 0x6D2B79F5) | 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

function mathRandom (start, end, seed) {
  const r = (seed === undefined) ? Math.random() : seededRandom(seed)
  return start + Math.floor(r * (end - start))
}
mathRandom.validate = (tokens, values) => {
  V.argCount('MathRandom', values, 2, 3)
  values.forEach((v, i) => V.isInteger('MathRandom', v, i + 1))
  if (values[0] >= values[1]) {
    throw Error(`States.MathRandom start (${values[0]}) must be less than end (${values[1]})`)
  }
}

function mathAdd (value1, value2) {
  return value1 + value2
}
mathAdd.validate = (tokens, values) => {
  V.argCount('MathAdd', values, 2)
  V.isInteger('MathAdd', values[0], 1)
  V.isInteger('MathAdd', values[1], 2)
}

module.exports = {
  MathRandom: mathRandom,
  MathAdd: mathAdd
}
