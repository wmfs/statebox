
class ErrorState {
  constructor (cause) {
    this.cause = `States.${cause}`
  }

  raise (error) { throw new ErrorInfo(this.cause, error) }
  toString () { return this.cause }
}

class ErrorInfo {
  constructor (cause, error) {
    this.cause = cause
    this.error = error
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
  'NoChoiceMatched'
]

const ErrorStates = { }

ErrorNames.forEach(c => {
  ErrorStates[c] = new ErrorState(c)
})

module.exports = ErrorStates
