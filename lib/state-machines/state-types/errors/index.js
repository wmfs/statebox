class ErrorState {
  constructor (cause) {
    this.code = `States.${cause}`
  }

  error (msg) { return new ErrorInfo(this.code, msg) }
  raise (msg) { throw this.error(msg) }
  toString () { return this.code }
}

class ErrorInfo {
  constructor (code, msg) {
    this.error = code
    this.cause = msg
  }
}

const ErrorNames = [
  'ALL',
  'Timeout',
  'TaskFailed',
  'Permissions',
  'ResultPathMatchFailure',
  'ParameterPathFailure',
  'BranchFailed',
  'NoChoiceMatched',
  'IntrinsicFailure'
]

const ErrorStates = { }

ErrorNames.forEach(c => {
  ErrorStates[c] = new ErrorState(c)
})

module.exports = ErrorStates
