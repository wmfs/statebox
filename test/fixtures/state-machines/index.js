module.exports = {
  formFilling: require('./form-filling.json'),
  errorCodeAndErrorObject: require('./error-code-and-error-object.json'),
  errorCodeAndMessage: require('./error-code-and-message.json'),
  errorException: require('./error-exception.json'),
  errorHttpCantConnect: require('./error-http-cant-connect.json'),
  errorHttpNotFound: require('./error-http-not-found.json'),
  helloWorld: require('./hello-world.json'),
  helloThenWorld: require('./hello-then-world.json'),
  helloThenWorldThroughException: require('./hello-world-with-caught-failures.json'),
  helloThenFailure: require('./hello-then-failure.json'),
  helloThenUncaughtFailure: require('./hello-then-uncaught-failure.json'),
  helloFailButLiveAgain: require('./hello-fail-but-live-again'),
  calculator: require('./calculator.json'),
  calculatorWithInputPaths: require('./calculator-with-input-paths.json'),
  choice: require('./choice-state/choice.json'),
  choiceWithInputPath: require('./choice-state/choice-with-input-path.json'),
  parallel: require('./parallel-state-machine.json'),
  parallelFail: require('./parallel-fail-state-machine.json'),
  parallelResults: require('./parallel-results-machine.json'),
  waitWithSeconds: require('./wait-state/wait-with-seconds.json'),
  waitWithSecondsPath: require('./wait-state/wait-with-seconds-path.json'),
  waitWithTimestampPath: require('./wait-state/wait-with-timestamp-path.json')
}
