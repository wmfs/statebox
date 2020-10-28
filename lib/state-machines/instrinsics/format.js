function statesFormat (formatString, ...args) {
  const segments = formatString.split('{}')

  const withSubstitutions = [segments.shift()]
  for (const index in segments) {
    withSubstitutions.push(args[index])
    withSubstitutions.push(segments[index])
  }

  return withSubstitutions.join('')
} // statesFormat

module.exports = statesFormat
