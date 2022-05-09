'use strict'

// Amazon States Language reference
//   Specification: https://states-language.net/spec.html
//   API: http://docs.aws.amazon.com/step-functions/latest/apireference/API_CreatestateMachine.html
//   https://aws.amazon.com/step-functions/
//   https://aws.amazon.com/blogs/aws/new-aws-step-functions-build-distributed-applications-using-visual-workstateMachines/

const StateMachines = require('./state-machines')
const Resources = require('./resources')
const Modules = require('./resources/modules')
const Status = require('./Status')
const CallbackManager = require('./Callback-manager')
const findDao = require('./dao-loader')

class Statebox {
  constructor (options = {}) {
    this.options = options
    this.stateMachines = StateMachines()
    this.modules = Modules()
    this.resources = Resources()
    this.resources.registerResolver('module', this.modules.resolver)

    this.ready_ = findDao(options)
      .then(dao => {
        info(options.messages, 'Statebox is ready')
        this.dao = dao
        this.callbackManager = new CallbackManager()
        this.options.dao = dao
        this.options.stateMachines = this.stateMachines
        this.options.callbackManager = this.callbackManager
        this.options.resources = this.resources
        this.options.startExecution = (input, stateMachineName, executionOptions) =>
          this.startExecution(input, stateMachineName, executionOptions)
      })
  }

  get ready () {
    return this.ready_
  } // ready

  createModuleResource (moduleName, moduleClass) {
    this.modules.createModule(moduleName, moduleClass)
  }

  createModuleResources (moduleResources) {
    this.modules.createModules(moduleResources)
  }

  listModuleResources () {
    return this.modules.listModules()
  }

  findModuleByName (name) {
    return this.modules.findModuleByName(name)
  }

  registerResourceResolver (resourceType, resolver) {
    this.resources.registerResolver(resourceType, resolver)
  }

  createStateMachine (stateMachineName, stateMachineDefinition, stateMachineMeta, env) {
    return this.stateMachines.createStateMachine(
      stateMachineName,
      stateMachineDefinition,
      stateMachineMeta,
      env,
      this.options)
  } // createStateMachine

  createStateMachines (stateMachineDefinitions, env) {
    return this.stateMachines.createStateMachines(
      stateMachineDefinitions,
      env,
      this.options)
  } // createStateMachines

  deleteStateMachine (name) {
    this.stateMachines.deleteStateMachine(name)
  }

  describeStateMachine (name) {
    this.stateMachines.describeStateMachine(name)
  }

  listStateMachines () {
    return this.stateMachines.listStateMachines()
  }

  findStateMachineByName (name) {
    return this.stateMachines.findStateMachineByName(name)
  }

  findStateMachines (options) {
    return this.stateMachines.findStateMachines(options)
  }

  findStates (options) {
    return this.stateMachines.findStates(options)
  }

  async startExecution (input, stateMachineName, executionOptions) {
    // References
    //   http://docs.aws.amazon.com/step-functions/latest/apireference/API_StartExecution.html
    //   http://docs.aws.amazon.com/step-functions/latest/apireference/API_DescribeExecution.html
    const stateMachineToStart = this.findStateMachineToStart_(stateMachineName)

    const executionDescription = await this.createNewExecution_(
      stateMachineName,
      stateMachineToStart,
      input,
      executionOptions
    )

    return this.startExecution_(stateMachineToStart, executionDescription, executionOptions)
  } // executioner

  async stopExecution (cause, errorCode, executionName, executionOptions) {
    const executionDescription = await this.dao.findExecutionByName(executionName)

    if (executionDescription && executionDescription.status === Status.RUNNING) {
      return this.dao.stopExecution(
        cause,
        errorCode,
        executionName,
        executionOptions
      )
    } else {
      throw new Error(`Execution is not running, and cannot be stopped (executionName='${executionName}')`)
    }
  } // _stopExecution

  describeExecution (executionName, updateLastDescribed) {
    return this.dao.describeExecution(executionName, updateLastDescribed)
  } // describeExecution

  async sendTaskSuccess (executionName, output) {
    const executionDescription = await this.dao.findExecutionByName(executionName)

    if (executionDescription && executionDescription.status === Status.RUNNING) {
      const stateToRun = this.stateMachines.findState(
        executionDescription.stateMachineName,
        executionDescription.currentStateName
      )
      return stateToRun.runTaskSuccess(executionDescription, output)
    } else {
      throw new Error(`Success has been rejected because execution is not running (executionName='${executionName}')`)
    }
  } // sendTaskSuccess

  async sendTaskFailure (executionName, errorInfo) {
    const executionDescription = await this.dao.findExecutionByName(executionName)

    if (executionDescription && executionDescription.status === Status.RUNNING) {
      const stateToRun = this.stateMachines.findState(
        executionDescription.stateMachineName,
        executionDescription.currentStateName
      )
      return stateToRun.runTaskFailure(executionDescription, errorInfo)
    } else {
      throw new Error(`Failure has been rejected because execution is not running (executionName='${executionName}')`)
    }
  } // sendTaskFailure

  sendTaskHeartbeat (executionName, updateResult) {
    return this.sendHeartbeat_(executionName, updateResult, false)
  } // _sendTaskHeartbeat

  sendTaskLastHeartbeat (executionName, updateResult) {
    return this.sendHeartbeat_(executionName, updateResult, true)
  } // sendTaskLastHeartbeat

  async sendHeartbeat_ (executionName, updateResult, isLast) {
    const executionDescription = await this.dao.findExecutionByName(executionName)

    if (executionDescription && executionDescription.status === Status.RUNNING) {
      const stateToRun = this.stateMachines.findState(
        executionDescription.stateMachineName,
        executionDescription.currentStateName
      )
      return stateToRun.runTaskHeartbeat(executionDescription, updateResult, isLast)
    } else {
      throw new Error(`Heartbeat has been rejected because execution is not running (executionName='${executionName}')`)
    }
  }

  async sendTaskRevivification (executionName) {
    const executionDescription = await this.dao.findExecutionByName(executionName)

    if (executionDescription && executionDescription.status === Status.FAILED) {
      const stateMachine = this.stateMachines.findStateMachineByName(executionDescription.stateMachineName)
      return stateMachine.runState(executionDescription)
    } else {
      throw new Error(`Revivification has been rejected because execution is not failed (executionName='${executionName}')`)
    }
  }

  async waitUntilStoppedRunning (executionName) {
    const executionDescription = await this.findRunningExecution_(executionName)

    if (executionDescription.status === Status.RUNNING) {
      return this.callbackManager.addCallback(
        Status.COMPLETE,
        executionName
      )
    }

    return executionDescription
  } // waitUntilStoppedRunning

  async findRunningExecution_ (executionName) {
    for (let notFound = 0; notFound !== 5; ++notFound) {
      const executionDescription = await this.dao.findExecutionByName(executionName)

      if (executionDescription) {
        return executionDescription
      }

      await pause(50)
    }

    throw new Error(`Could not find execution ${executionName}`)
  } // findRunningExecution_

  findStateMachineToStart_ (stateMachineName) {
    const toStart = this.findStateMachineByName(stateMachineName)
    if (!toStart) {
      // No stateMachine!
      throw new Error(`Unknown stateMachine with name '${stateMachineName}'`)
    }
    return toStart
  } // findStateMachineToStart_

  async createNewExecution_ (stateMachineName, stateMachineToStart, input, executionOptions) {
    const startAtResource = stateMachineToStart.definition.States[stateMachineToStart.startAt].Resource
    const executionDescription = await this.dao.createNewExecution(
      stateMachineToStart.startAt,
      startAtResource,
      input,
      stateMachineName,
      executionOptions
    )
    return executionDescription
  } // createNewExecution_

  startExecution_ (stateMachineToStart, executionDescription, executionOptions) {
    stateMachineToStart.processState(executionDescription.executionName)

    if (hasDelayedResponse(executionOptions)) {
      return this.callbackManager.addCallback(
        executionOptions.sendResponse,
        executionDescription.executionName
      )
    }

    return executionDescription
  } // startExecution_
} // class Statebox

function pause (duration) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), duration)
  })
} // _pause

function info (messages, msg) {
  if (messages) {
    messages.info(msg)
  } else {
    console.log(msg)
  }
} // info

function hasDelayedResponse (executionOptions) {
  return executionOptions.sendResponse &&
    executionOptions.sendResponse !== 'IMMEDIATELY'
} // hasCallback

module.exports = Statebox
