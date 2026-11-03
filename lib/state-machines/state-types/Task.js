const BaseStateType = require('./Base-state')
const boom = require('@hapi/boom')
const jp = require('jsonpath')
const _ = require('lodash')
const debug = require('debug')('statebox')
const States = require('./errors')

// TODO: http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
class Context {
  constructor (executionDescription, task) {
    this.executionName = executionDescription.executionName
    this.executionOptions = executionDescription.executionOptions
    this.userId = executionDescription.executionOptions.userId
    this.stateMachineMeta = task.stateMachine.meta
    this.task = task

    this.complete = null
    this.heartbeat = null
    this.onComplete = new Promise(resolve => { this.complete = resolve })
    this.onHeartbeat = new Promise(resolve => { this.heartbeat = resolve })

    this.completed = false
  }

  alreadyCompleted (method) {
    if (this.completed) {
      console.warn(`${method}(${this.executionName}) ignored: task already completed`)
      return true
    }
    this.completed = true
    return false
  }

  sendTaskSuccess (output) {
    if (this.alreadyCompleted('sendTaskSuccess')) return
    debug(`sendTaskSuccess(${this.executionName})`)
    this.task.processTaskSuccess(this.executionName, output)
      .then(result => this.complete(result))
      .catch(err => console.error(`processTaskSuccess failed (${this.executionName})`, err))
  }

  sendTaskFailure (errorInfo) {
    if (this.alreadyCompleted('sendTaskFailure')) return
    console.error(`sendTaskFailure(${this.executionName}, ${JSON.stringify(errorInfo)})`)
    debug(`sendTaskFailure(${this.executionName}, ${JSON.stringify(errorInfo)})`)
    this.task.processTaskFailure(errorInfo, this.executionName)
      .then(result => this.complete(result))
      .catch(err => console.error(`processTaskFailure failed (${this.executionName})`, err))
  }

  sendTaskHeartbeat (output) {
    debug(`sendTaskHeartbeat(${this.executionName})`)
    return this.task.processTaskHeartbeat(output, this.executionName)
      .then(result => { this.heartbeat(result); return result })
  }

  resolveInputPaths (input, template) {
    const clonedInput = cloneOrDefault(input)
    const clonedTemplate = cloneOrDefault(template)
    resolvePaths(clonedInput, clonedTemplate)
    return clonedTemplate
  }
}

function cloneOrDefault (obj) {
  return (_.isObject(obj)) ? _.cloneDeep(obj) : { }
} // cloneOrDefault

function resolvePaths (input, root) {
  if (!_.isObject(root)) return

  // TODO: Support string-paths inside arrays
  if (Array.isArray(root)) {
    root.forEach(element => resolvePaths(input, element))
    return
  }

  for (const [key, value] of Object.entries(root)) {
    if (isJSONPath(value)) {
      root[key] = jp.value(input, value)
    } else {
      resolvePaths(input, value)
    }
  } // for ...
} // resolvePaths

function isJSONPath (p) {
  return _.isString(p) && p.length !== 0 && p[0] === '$'
} // isJSONPath

/// //////////////////////////////////
class Task extends BaseStateType {
  constructor (stateName, stateMachine, stateDefinition, options) {
    super(stateName, stateMachine, stateDefinition, options)
    this.stateType = 'Task'

    try {
      this.resource = options.resources.resolve(
        stateDefinition.Resource,
        stateDefinition.ResourceConfig,
        this.stateMachineName
      )
    } catch (err) {
      throw (boom.badRequest(`Unable to create Task '${stateName}' in stateMachine '${this.stateMachineName}' - ${err.message}`))
    }
  } // constructor

  stateTypeInit (env) {
    return this.resource.init(env)
  } // stateTypeInit

  get resourceExpectsDoneCallback () { return this.resource.resourceExpectsDoneCallback }

  process (executionDescription, input) {
    const context = new Context(executionDescription, this)

    Promise.resolve()
      .then(() => this.resource.run(input, context)) // sync throws AND async rejections land in .catch
      .catch(e => {
        logUnhandledTaskError(e, executionDescription)
        // TODO: Sending out error details might leak security info... implement "dev mode" flag?
        context.sendTaskFailure(States.TaskFailed.error(String(e)))
      })

    return [context.onComplete, context.onHeartbeat]
  }
}

function logUnhandledTaskError (e, executionDescription) {
  console.error(
    '\nUNHANDLED EXCEPTION WHILE PROCESSING TASK ------------------------------------\n' +
    `error: ${e}\n` +
    `executionName: ${executionDescription.executionName}\n` +
    `stateMachineName: ${executionDescription.stateMachineName}\n` +
    `currentStateName: ${executionDescription.currentStateName}\n` +
    `parentExecutionName: ${executionDescription.executionOptions.parentExecutionName}\n` +
    `startDate: ${executionDescription.startDate}\n` +
    `ctx: ${JSON.stringify(executionDescription.ctx)}\n\n` +
    'STACK\n-----\n' + (e && e.stack) + '\n' +
    '------------------------------------------------------------------------------\n'
  )
}

module.exports = Task
