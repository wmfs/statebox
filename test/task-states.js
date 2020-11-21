/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

// stateMachines
const taskStateMachines = require('./fixtures/state-machines/task-state')
const moduleResources = require('./fixtures/module-resources')

const Statebox = require('./../lib')

let statebox

describe('Task State', function () {
  before('setup statebox', async () => {
    statebox = new Statebox()
    await statebox.ready
    statebox.createModuleResources(moduleResources)
    await statebox.createStateMachines(taskStateMachines, {})
  })

  const georefOf = { georefOf: 'Home' }

  const taskStates = {
    task: georefOf,
    // taskWithResult: {
    //  'x-datum': 0,
    //  'y-datum': 600
    // },
    taskWithResultPath: {
      georefOf: 'Home',
      where: { georefOf: 'Home' }
    },
    taskWithResultSelector: {
      georefOf: 'Home',
      'x-datum': 0,
      'y-datum': 600
    },
    taskWithDynamicResultSelector: {
      georefOf: 'Home',
      place: 'Home'
    },
    taskWithResultSelectorAndResultPath: {
      georefOf: 'Home',
      coords: {
        'x-datum': 0,
        'y-datum': 600
      }
    },
    taskWithDynamicResultSelectorAndResultPath: {
      georefOf: 'Home',
      where: {
        place: 'Home'
      }
    },
    taskWithResultSelectorAndNullResultPath: georefOf,
    taskWithDynamicResultSelectorAndNullResultPath: georefOf,
    taskWithInputPath: 'Home',
    taskWithInputPathAndResultPath: {
      georefOf: 'Home',
      place: 'Home'
    },
    // taskWithNullInputPath: { },
    taskWithNullInputPathAndResultPath: {
      georefOf: 'Home',
      place: { }
    },
    taskWithResultSelectorAndNullOutputPath: { },
    taskWithDynamicResultSelectorAndNullOutputPath: { },
    taskWithResultSelectorResultPathAndOutputPath: {
      'x-datum': 0,
      'y-datum': 600
    },
    taskWithDynamicResultSelectorResultPathAndOutputPath: {
      place: 'Home'
    },
    taskWithFixedParameters: {
      georefOf: 'Home',
      'x-datum': 0,
      'y-datum': 600
    },
    taskWithFixedParametersAndResultSelector: {
      georefOf: 'Home',
      'x-datum': 1000,
      'y-datum': 1600
    },
    taskWithFixedParametersAndDynamicResultSelector: {
      georefOf: 'Home',
      'x-datum': 0,
      'y-datum': 1600
    },
    taskWithFixedParametersAndResultSelectorResultPath: {
      georefOf: 'Home',
      place: {
        'x-datum': 1000,
        'y-datum': 1600
      }
    },
    taskWithFixedParametersAndDynamicResultSelectorResultPath: {
      georefOf: 'Home',
      place: {
        'x-datum': 0,
        'y-datum': 600
      }
    },
    taskWithFixedParametersAndNullOutputPath: { },
    taskWithFixedParametersAndResultPath: {
      georefOf: 'Home',
      place: {
        'x-datum': 0,
        'y-datum': 600
      }
    },
    taskWithFixedParametersResultPathAndOutputPath: {
      'x-datum': 0,
      'y-datum': 600
    },
    taskWithFixedParametersResultSelectorResultPathAndOutputPath: {
      'x-datum': 1000,
      'y-datum': 1600
    },
    taskWithFixedParametersDynamicResultSelectorResultPathAndOutputPath: {
      'x-datum': 0,
      'y-datum': 600
    },
    taskWithFixedParametersDynamicResultSelectorAndOutputPath: {
      'x-datum': 0,
      'y-datum': 600
    },
    taskWithDynamicParameters: {
      georefOf: 'Home',
      'x-datum': 0,
      'y-datum': 600,
      input: {
        where: 'Home'
      }
    },
    taskWithDynamicParametersAndResultSelector: {
      georefOf: 'Home',
      'x-datum': 1000,
      'y-datum': 1600
    },
    taskWithDynamicParametersAndDynamicResultSelector: {
      georefOf: 'Home',
      'x-datum': 0,
      'y-datum': 600
    },
    taskWithDynamicParametersAndResultSelectorResultPath: {
      georefOf: 'Home',
      place: {
        'x-datum': 1000,
        'y-datum': 1600
      }
    },
    taskWithDynamicParametersAndDynamicResultSelectorResultPath: {
      georefOf: 'Home',
      place: {
        'x-datum': 0,
        'y-datum': 600
      }
    },
    taskWithDynamicParametersAndNullOutputPath: { },
    taskWithDynamicParametersAndResultPath: {
      georefOf: 'Home',
      place: {
        'x-datum': 0,
        'y-datum': 600,
        where: {
          georefOf: 'Home'
        }
      }
    },
    taskWithDynamicParametersResultPathAndOutputPath: {
      'x-datum': 0,
      'y-datum': 600,
      where: 'Home'
    },
    taskWithDynamicParametersResultSelectorResultPathAndOutputPath: {
      'x-datum': 1000,
      'y-datum': 1600
    },
    taskWithDynamicParametersDynamicResultSelectorResultPathAndOutputPath: {
      place: 'Home'
    },
    taskWithDynamicParametersDynamicResultSelectorAndOutputPath: {
      place: 'Home',
      coords: {
        x: 0,
        y: 600
      }
    }
  }

  for (const [name, result] of Object.entries(taskStates)) {
    test(
      name,
      name,
      georefOf,
      result
    )
  } // for ...
})

function test (label, statemachine, input, result) {
  it(label, async () => {
    const executionDescription = await runStateMachine(statemachine, input)

    expect(executionDescription.status).to.eql('SUCCEEDED')
    expect(executionDescription.stateMachineName).to.eql(statemachine)
    expect(executionDescription.currentStateName).to.eql('TaskState')
    expect(executionDescription.currentResource).to.eql('module:passThrough')
    expect(executionDescription.ctx).to.eql(result)
  }) // it ...
}

async function runStateMachine (statemachine, input) {
  const executionDescription = await statebox.startExecution(
    Object.assign({}, input),
    statemachine,
    {} // options
  )

  return statebox.waitUntilStoppedRunning(executionDescription.executionName)
}