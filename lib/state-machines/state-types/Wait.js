const BaseStateType = require('./Base-state')
const debug = require('debug')('statebox')
const jp = require('jsonpath')
const { DateTime } = require('luxon')

/* https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-wait-state.html */
class Context {
  constructor (executionDescription, task) {
    this.executionName = executionDescription.executionName
    this.executionOptions = executionDescription.executionOptions
    this.userId = executionDescription.executionOptions.userId
    this.task = task
  }

  sendTaskSuccess (output) {
    debug(`sendTaskSuccess(${this.executionName})`)
    this.task.processTaskSuccess(this.executionName, output)
  }

  sendTaskFailure (errorInfo) {
    debug(`sendTaskFailure(${this.executionName})`)
    this.task.processTaskFailure(errorInfo, this.executionName)
  }

  sendTaskHeartbeat (output, callback) {
    debug(`sendTaskHeartbeat(${this.executionName})`)
    if (!callback) {
      console.log(new Error('Missing callback parameter in call to sendTaskHeartbeat'))
      callback = () => {}
    }
    this.task.processTaskHeartbeat(output, this.executionName, callback)
  }
}

////////////
class Wait extends BaseStateType {
  constructor (stateName, stateMachine, stateDefinition, options) {
    super(stateName, stateMachine, stateDefinition, options)
    this.stateMachine = stateMachine
    this.timeoutFn = findTimeoutFn(stateDefinition)
  } // constructor

  process (executionDescription) {
    const context = new Context(executionDescription, this)
    const timeoutSeconds = this.timeoutFn(executionDescription.ctx)
    const timeout = timeoutSeconds * 1000

    Promise.resolve().then(
      () => {
        try {
          setTimeout(() => context.sendTaskSuccess('', executionDescription.executionName), timeout)
        } catch (e) {
          console.error(
            '\nUNHANDLED EXCEPTION WHILE PROCESSING WAIT ------------------------------------\n' +
            `error: ${e}\n` +
            `executionName: ${executionDescription.executionName}\n` +
            `stateMachineName: ${executionDescription.stateMachineName}\n` +
            `currentStateName: ${executionDescription.currentStateName}\n` +
            `parentExecutionName: ${executionDescription.executionOptions.parentExecutionName}\n` +
            `rootExecutionName: ${executionDescription.executionOptions.rootExecutionName}\n` +
            `startDate: ${executionDescription.startDate}\n` +
            `ctx: ${JSON.stringify(executionDescription.ctx)}\n\n` +
            'STACK\n' +
            '-----\n' +
            e.stack + '\n' +
            '------------------------------------------------------------------------------\n'
          )
          // TODO: Sending out error details might leak security info... implement "dev mode" flag?
          this.processTaskFailure(
            {
              error: 'States.WaitFail',
              cause: e.toString()
            },
            executionDescription.executionName
          )
        }
      }
    )
  }
} // class Wait

function findTimeoutFn (stateDefinition) {
  for (const [field, makerFn] of Object.entries(TimeoutFunctionMaker)) {
    if (stateDefinition[field]) {
      return makerFn(stateDefinition)
    }
  }
} // findTimeoutFn

const TimeoutFunctionMaker = {
  Seconds: stateDef => () => stateDef.Seconds,
  SecondsPath: stateDef => ctx => jp.value(ctx, stateDef.SecondsPath),
  Timestamp: stateDef => () => durationFromTimestamp(stateDef.Timestamp),
  TimestampPath: stateDef => ctx => durationFromTimestampPath(ctx, stateDef.TimestampPath)
}

function durationFromTimestampPath (ctx, timestampPath) {
  const timestampStr = jp.value(ctx, timestampPath)
  return durationFromTimestamp(timestampStr)
}

function durationFromTimestamp (timestampStr) {
  const when = DateTime.fromISO(timestampStr)
  const now = DateTime.local()

  const duration = when.diff(now).as('seconds')

  return (duration > 0) ? duration : 0
} // durationFromTimestamp

module.exports = Wait
