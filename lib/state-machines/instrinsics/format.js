function statesFormat (formatString, ...args) {
  const segments = formatString.split('{}')

  const withSubstitutions = [segments.shift()]
  for (const index in segments) {
    const arg = args[index] !== null ? args[index] : 'null'
    withSubstitutions.push(arg)
    withSubstitutions.push(segments[index])
  }

  return withSubstitutions.join('')
} // statesFormat

module.exports = statesFormat
