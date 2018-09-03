'use strict'

const _ = require('lodash')
const StateMachine = require('./State-machine')

const stateMachines = {}

function validateStateMachineDefinition (stateMachineName, definition) {
  // TODO: Make it validate! Is there a JSON Schema for Amazon State Language out there?
  // TODO: Make it adhere to everything at https://states-language.net/spec.html
  // TODO: Needs at least one state defined
  // TODO: State "Types" need to be provided, and refer to a type which is available
  // TODO: StartAt needs to be present, and refer to a state which is defined in (state-types)
  // TODO: Check that any resources referred to in Task states have been created
  return {
    summary: {
      name: stateMachineName,
      errorCount: 0,
      warningCount: 0
    },
    errors: [],
    warnings: []
  }
}

function findStates (options) {
  const states = []
  _.forOwn(
    stateMachines,
    function (stateMachine) {
      _.forOwn(
        stateMachine.states,
        function (state) {
          const resource = state.definition.Resource
          if (resource && options.resourceToFind === resource) {
            states.push(state)
          }
        }
      )
    }
  )
  return states
}

function parseMachine (parsedStateMachines, stateMachineName, topLevel, root) {
  if (_.isArray(root)) {
    root.forEach(
      function (arrayElement) {
        parseMachine(parsedStateMachines, stateMachineName, topLevel, arrayElement)
      }
    )
  } else if (_.isObject(root)) {
    if (root.hasOwnProperty('StartAt')) {
      if (topLevel) {
        parsedStateMachines[stateMachineName] = root
      } else {
        parsedStateMachines[`${stateMachineName}:${root.StartAt}`] = root
      }
    }
    _.forOwn(
      root,
      function (value, key) {
        parseMachine(parsedStateMachines, stateMachineName, false, value)
      }
    )
  }
}

function parseStateMachines (stateMachineName, stateMachineDefinition) {
  const parsedStateMachines = {}
  parseMachine(parsedStateMachines, stateMachineName, true, stateMachineDefinition)
  return parsedStateMachines
}

async function createStateMachine (stateMachineName, stateMachineDefinition, env, options) {
  const parsedStateMachines = parseStateMachines(stateMachineName, stateMachineDefinition)

  for (const [stateMachineName, stateMachine] of Object.entries(parsedStateMachines)) {
    const sm = new StateMachine()
    await sm.init(
      stateMachineName,
      stateMachine,
      env,
      options
    )
    stateMachines[stateMachineName] = sm
  }
} // createStateMachine

function createStateMachines (stateMachineDefinitions, env, options) {
  const machines = Object.entries(stateMachineDefinitions)
    .map(([name, definition]) => this.createStateMachine(name, definition, env, options))

  return Promise.all(machines)
} // createStateMachines

function deleteStateMachine (name) {
}

function describeStateMachine (name) {
}

function listStateMachines () {
  return stateMachines
}

function findStateMachineByName (name) {
  return stateMachines[name]
}

function findStateMachines (options) {
}

module.exports.stateMachines = stateMachines
module.exports.createStateMachine =  createStateMachine
module.exports.createStateMachines = createStateMachines

module.exports.findStateMachineByName = findStateMachineByName
module.exports.findStateMachines = findStateMachines
module.exports.deleteStateMachine = deleteStateMachine
module.exports.describeStateMachine = describeStateMachine
module.exports.listStateMachines = listStateMachines
module.exports.findStates = findStates
module.exports.validateStateMachineDefinition = validateStateMachineDefinition
