/*
 States.Format description from https://states-language.net/#appendix-b

 States.Format

 This Intrinsic Function takes one or more arguments. The Value of the
 first MUST be a string, which MAY include zero or more instances of
 the character sequence {}. There MUST be as many remaining arguments
 in the Intrinsic Function as there are occurrences of {}. The interpreter
 returns the first-argument string with each {} replaced by the Value of
 the positionally-corresponding argument in the Intrinsic Function.

 If necessary, the { and } characters can be escaped respectively as \\{ and \\}.

 If the argument is a Path, applying it to the input MUST yield a value
 that is a string, a boolean, a number, or null. In each case, the Value
 is the natural string representation; string values are not accompanied
 by enclosing " characters. The Value MUST NOT be a JSON array or object.
*/

function statesFormat (formatString, ...args) {
  const segments = formatString.split('{}')

  if (segments.length - 1 !== args.length) {
    throw Error(`States.Format expected ${segments.length - 1} format values, got ${args.length}`)
  }

  const withSubstitutions = [segments.shift()]
  for (const index in segments) {
    const arg = args[index] !== null ? args[index] : 'null'
    if (typeof arg === 'object') {
      throw Error(`States.Format argument ${index + 1} is an object, expected string, number, boolean, or null`)
    }
    withSubstitutions.push(arg)
    withSubstitutions.push(segments[index])
  }

  return withSubstitutions.join('')
} // statesFormat

module.exports = statesFormat
