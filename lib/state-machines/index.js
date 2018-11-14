'use strict'

const StateMachine = require('./State-machine')

const stateMachines = new Map()

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
  const allStates = [...stateMachines.values()]
    .map(stateMachine => Object.values(stateMachine.states))
  const flattenedStates = [].concat(...allStates)
  return flattenedStates.filter(state => {
    const resource = state.definition.Resource
    return (resource && options.resourceToFind === resource)
  })

  /*
    return Object.values(stateMachines)
      .flatMap(stateMachines => Object.values(stateMachine.states))
      .filter(state => {
        const resource = state.definition.Resource
        return (resource && options.resourceToFind === resource)
      })
   */
} // findStates

function parseMachine (parsedStateMachines, stateMachineName, topLevel, root) {
  if (Array.isArray(root)) {
    root.forEach(elem =>
      parseMachine(parsedStateMachines, stateMachineName, topLevel, elem)
    )
  } else if ((root != null) && (typeof root === 'object')) {
    if (root.hasOwnProperty('StartAt')) {
      if (topLevel) {
        parsedStateMachines[stateMachineName] = root
      } else {
        parsedStateMachines[`${stateMachineName}:${root.StartAt}`] = root
      }
    }
    Object.entries(root)
      .forEach(elem =>
        parseMachine(parsedStateMachines, stateMachineName, false, elem)
      )
  }
}

function parseStateMachines (stateMachineName, stateMachineDefinition) {
  const parsedStateMachines = {}
  parseMachine(parsedStateMachines, stateMachineName, true, stateMachineDefinition)
  return parsedStateMachines
} // parseStateMachines

async function createStateMachine (stateMachineName, stateMachineDefinition, stateMachineMeta, env, options) {
  const parsedStateMachines = parseStateMachines(stateMachineName, stateMachineDefinition)

  for (const [stateMachineName, stateMachineDefinition] of Object.entries(parsedStateMachines)) {
    const sm = new StateMachine()
    await sm.init(
      stateMachineName,
      stateMachineDefinition,
      stateMachineMeta,
      env,
      options
    )
    stateMachines.set(stateMachineName, sm)
  }
} // createStateMachine

function createStateMachines (stateMachineDefinitions, env, options) {
  const machines = Object.entries(stateMachineDefinitions)
    .map(([name, definition]) => this.createStateMachine(
      name,
      definition,
      {}, // stateMachineMeta
      env,
      options)
    )

  return Promise.all(machines)
} // createStateMachines

function deleteStateMachine (name) {
}

function describeStateMachine (name) {
}

function listStateMachines () {
  return [...stateMachines.values()]
    .map(sm => {
      return {
        name: sm.name,
        description: sm.definition.Comment || '<no description available>',
        categories: sm.definition.categories || [],
        instigators: sm.definition.instigators || []
      }
    })
}

function findStateMachineByName (name) {
  return stateMachines.get(name)
}

function findStateMachines (options) {
}

module.exports.stateMachines = stateMachines
module.exports.createStateMachine = createStateMachine
module.exports.createStateMachines = createStateMachines

module.exports.findStateMachineByName = findStateMachineByName
module.exports.findStateMachines = findStateMachines
module.exports.deleteStateMachine = deleteStateMachine
module.exports.describeStateMachine = describeStateMachine
module.exports.listStateMachines = listStateMachines
module.exports.findStates = findStates
module.exports.validateStateMachineDefinition = validateStateMachineDefinition
