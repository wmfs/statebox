const BaseStateType = require('./Base-state')
const Resources = require('./../../resources')
const boom = require('boom')
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

    this.toggle = null
    this.latch = new Promise(resolve => { this.toggle = resolve })
  }

  sendTaskSuccess (output) {
    debug(`sendTaskSuccess(${this.executionName})`)
    this.task.processTaskSuccess(this.executionName, output)
      .then(result => this.toggle(result))
  }

  sendTaskFailure (errorInfo) {
    console.error(`sendTaskFailure(${this.executionName}, ${JSON.stringify(errorInfo)})`)
    debug(`sendTaskFailure(${this.executionName}, ${JSON.stringify(errorInfo)})`)
    this.task.processTaskFailure(errorInfo, this.executionName)
      .then(result => this.toggle(result))
  }

  sendTaskHeartbeat (output) {
    debug(`sendTaskHeartbeat(${this.executionName})`)
    return this.task.processTaskHeartbeat(output, this.executionName)
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
      this.resource = Resources.resolve(
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

  process (executionDescription, input, optionalDoneCallback) {
    const context = new Context(executionDescription, this)

    Promise.resolve().then(() => {
      try {
        this.resource.run(
          input,
          context,
          optionalDoneCallback
        )
      } catch (e) {
        console.error(
          '\nUNHANDLED EXCEPTION WHILE PROCESSING TASK ------------------------------------\n' +
          `error: ${e}\n` +
          `executionName: ${executionDescription.executionName}\n` +
          `stateMachineName: ${executionDescription.stateMachineName}\n` +
          `currentStateName: ${executionDescription.currentStateName}\n` +
          `parentExecutionName: ${executionDescription.executionOptions.parentExecutionName}\n` +
          `startDate: ${executionDescription.startDate}\n` +
          `ctx: ${JSON.stringify(executionDescription.ctx)}\n\n` +
          'STACK\n' +
          '-----\n' +
          e.stack + '\n' +
          '------------------------------------------------------------------------------\n'
        )
        // TODO: Sending out error details might leak security info... implement "dev mode" flag?
        this.processTaskFailure(
          States.TaskFailed.error(e.toString()),
          executionDescription.executionName
        )
      }
    })

    return context.latch
  }
}

module.exports = Task
