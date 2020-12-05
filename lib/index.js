'use strict'

// Amazon States Language reference
//   Specification: https://states-language.net/spec.html
//   API: http://docs.aws.amazon.com/step-functions/latest/apireference/API_CreatestateMachine.html
//   https://aws.amazon.com/step-functions/
//   https://aws.amazon.com/blogs/aws/new-aws-step-functions-build-distributed-applications-using-visual-workstateMachines/

const StateMachines = require('./state-machines')
const Resources = require('./resources')
const Status = require('./Status')
const CallbackManager = require('./Callback-manager')
const findDao = require('./dao-loader')

class Statebox {
  constructor (options = {}) {
    this.options = options
    this.stateMachines = StateMachines()
    this.ready_ = findDao(options)
      .then(dao => {
        info(options.messages, 'Statebox is ready')
        this.dao = dao
        this.callbackManager = new CallbackManager()
        this.options.dao = dao
        this.options.stateMachines = this.stateMachines
        this.options.callbackManager = this.callbackManager
        this.options.startExecution = (input, stateMachineName, executionOptions) =>
          this.startExecution(input, stateMachineName, executionOptions)
      })
  }

  get ready () {
    return this.ready_
  } // ready

  createModuleResource (moduleName, moduleClass) {
    Resources.createModule(moduleName, moduleClass)
  }

  createModuleResources (moduleResources) {
    Resources.createModules(moduleResources)
  }

  listModuleResources () {
    return Resources.listModules()
  }

  findModuleByName (name) {
    return Resources.findModuleByName(name)
  }

  registerResourceResolver (resourceType, resolver) {
    Resources.registerResolver(resourceType, resolver)
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
    const stateMachineToExecute = this.stateMachines.findStateMachineByName(stateMachineName)
    if (!stateMachineToExecute) {
      // No stateMachine!
      throw new Error(`Unknown stateMachine with name '${stateMachineName}'`)
    } // if ...

    const currentResource = stateMachineToExecute.definition.States[stateMachineToExecute.startAt].Resource
    const executionDescription = await this.dao.createNewExecution(
      stateMachineToExecute.startAt,
      currentResource,
      input,
      stateMachineName,
      executionOptions
    )

    stateMachineToExecute.processState(executionDescription.executionName)
    if (hasDelayedResponse(executionOptions)) {
      return this.callbackManager.addCallback(
        executionOptions.sendResponse,
        executionDescription.executionName
      )
    }

    return executionDescription
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

  describeExecution (executionName) {
    return this.dao.findExecutionByName(executionName)
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
    let notFound = 0

    do {
      const executionDescription = await this.dao.findExecutionByName(executionName)

      if (typeof executionDescription !== 'object') {
        ++notFound
      } else if (executionDescription.status !== Status.RUNNING) {
        return executionDescription
      }

      await pause(50)
    } while (notFound !== 5)

    throw new Error(`Could not find execution ${executionName}`)
  } // _waitUntilStoppedRunning
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
