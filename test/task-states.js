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

  const georefOf = {
    georefOf: 'Home',
    theOtherGeorefOf: {
      georefOf: 'Work'
    }
  }

  const taskStates = {
    task: georefOf,
    // taskWithResult: {
    //  'x-datum': 0,
    //  'y-datum': 600
    // },
    taskWithResultPath: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
      where: { georefOf: 'Home', theOtherGeorefOf: { georefOf: 'Work' } }
    },
    taskWithResultSelector: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
      'x-datum': 0,
      'y-datum': 600
    },
    taskWithDynamicResultSelector: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
      place: 'Home'
    },
    taskWithResultSelectorAndResultPath: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
      coords: {
        'x-datum': 0,
        'y-datum': 600
      }
    },
    taskWithDynamicResultSelectorAndResultPath: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
      where: {
        place: 'Home'
      }
    },
    taskWithResultSelectorAndNullResultPath: georefOf,
    taskWithDynamicResultSelectorAndNullResultPath: georefOf,
    taskWithInputPath: 'Home',
    taskWithInputPathAndResultPath: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
      place: 'Home'
    },
    // taskWithNullInputPath: { },
    taskWithNullInputPathAndResultPath: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
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
      theOtherGeorefOf: { georefOf: 'Work' },
      'x-datum': 0,
      'y-datum': 600
    },
    taskWithFixedParametersAndResultSelector: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
      'x-datum': 1000,
      'y-datum': 1600
    },
    taskWithFixedParametersAndDynamicResultSelector: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
      'x-datum': 0,
      'y-datum': 1600
    },
    taskWithFixedParametersAndResultSelectorResultPath: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
      place: {
        'x-datum': 1000,
        'y-datum': 1600
      }
    },
    taskWithFixedParametersAndDynamicResultSelectorResultPath: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
      place: {
        'x-datum': 0,
        'y-datum': 600
      }
    },
    taskWithFixedParametersAndNullOutputPath: { },
    taskWithFixedParametersAndResultPath: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
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
      theOtherGeorefOf: { georefOf: 'Work' },
      'x-datum': 0,
      'y-datum': 600,
      input: {
        where: 'Home'
      }
    },
    taskWithDynamicParametersAndResultSelector: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
      'x-datum': 1000,
      'y-datum': 1600
    },
    taskWithDynamicParametersAndDynamicResultSelector: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
      'x-datum': 0,
      'y-datum': 600
    },
    taskWithDynamicParametersAndResultSelectorResultPath: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
      place: {
        'x-datum': 1000,
        'y-datum': 1600
      }
    },
    taskWithDynamicParametersAndDynamicResultSelectorResultPath: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
      place: {
        'x-datum': 0,
        'y-datum': 600
      }
    },
    taskWithDynamicParametersAndNullOutputPath: { },
    taskWithDynamicParametersAndResultPath: {
      georefOf: 'Home',
      theOtherGeorefOf: { georefOf: 'Work' },
      place: {
        'x-datum': 0,
        'y-datum': 600,
        where: {
          georefOf: 'Home',
          theOtherGeorefOf: { georefOf: 'Work' }
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
