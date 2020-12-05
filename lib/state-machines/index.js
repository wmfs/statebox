'use strict'

const StateMachine = require('./State-machine')

class StateMachines {
  constructor () {
    this.stateMachines = new Map()
  } // constructor

  findStates (options) {
    const allStates = [...this.stateMachines.values()]
      .map(stateMachine => Object.values(stateMachine.states))
    const flattenedStates = [].concat(...allStates)
    return flattenedStates.filter(state => {
      const resource = state.definition.Resource
      return (resource && options.resourceToFind === resource)
    })

    /*
      return Object.values(this.stateMachines)
        .flatMap(this.stateMachines => Object.values(stateMachine.states))
        .filter(state => {
          const resource = state.definition.Resource
          return (resource && options.resourceToFind === resource)
        })
     */
  } // findStates

  parseMachine (parsedStateMachines, stateMachineName, topLevel, root) {
    if (Array.isArray(root)) {
      root.forEach(elem =>
        this.parseMachine(parsedStateMachines, stateMachineName, topLevel, elem)
      )
    } else if ((root != null) && (typeof root === 'object')) {
      if (Object.prototype.hasOwnProperty.call(root, 'StartAt')) {
        if (topLevel) {
          parsedStateMachines[stateMachineName] = root
        } else {
          parsedStateMachines[`${stateMachineName}:${root.StartAt}`] = root
        }
      }
      Object.entries(root)
        .forEach(elem =>
          this.parseMachine(parsedStateMachines, stateMachineName, false, elem)
        )
    }
  }

  parseStateMachines (stateMachineName, stateMachineDefinition) {
    const parsedStateMachines = {}
    this.parseMachine(parsedStateMachines, stateMachineName, true, stateMachineDefinition)
    return parsedStateMachines
  } // parseStateMachines

  async createStateMachine (stateMachineName, stateMachineDefinition, stateMachineMeta, env, options) {
    const parsedStateMachines = this.parseStateMachines(stateMachineName, stateMachineDefinition)

    for (const [stateMachineName, stateMachineDefinition] of Object.entries(parsedStateMachines)) {
      const sm = new StateMachine()
      await sm.init(
        stateMachineName,
        stateMachineDefinition,
        stateMachineMeta,
        env,
        options
      )
      this.stateMachines.set(stateMachineName, sm)
    }
  } // createStateMachine

  createStateMachines (stateMachineDefinitions, env, options) {
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

  deleteStateMachine (name) {
  }

  describeStateMachine (name) {
  }

  listStateMachines () {
    return [...this.stateMachines.values()]
      .map(sm => {
        const res = {
          name: sm.name,
          title: sm.definition.name || sm.name,
          description: sm.definition.Comment || '<no description available>',
          categories: sm.definition.categories || [],
          instigators: sm.definition.instigators || []
        }

        if (res.instigators.includes('user')) {
          res.instigatorGroup = sm.definition.instigatorGroup || 'form'
        }

        res.canBeStartedOffline = !!sm.definition.canBeStartedOffline

        return res
      })
  }

  findStateMachineByName (name) {
    return this.stateMachines.get(name)
  }

  findState (stateMachineName, stateName) {
    return this.findStateMachineByName(stateMachineName).findStateByName(stateName)
  }

  findStateDefinition (stateMachineName, stateName) {
    return this.findStateMachineByName(stateMachineName).findStateDefinitionByName(stateName)
  }

  findStateMachines (options) {
  }
}

module.exports = () => new StateMachines()
