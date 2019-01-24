/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

// stateMachines
const passStateMachines = require('./fixtures/state-machines/pass-state')

const Statebox = require('./../lib')

let statebox

describe('Pass State', function () {
  before('setup statebox', async () => {
    statebox = new Statebox()
    await statebox.ready
    await statebox.createStateMachines(passStateMachines, {})
  })

  const georefOf = { georefOf: 'Home' }

  const passStates = {
    pass: georefOf,
    // passWithResult: {
    //  'x-datum': 0,
    //  'y-datum': 600
    // },
    passWithResultPath: {
      georefOf: 'Home',
      where: { georefOf: 'Home' }
    },
    passWithResultAndResultPath: {
      georefOf: 'Home',
      coords: {
        'x-datum': 0,
        'y-datum': 600
      }
    },
    passWithResultAndNullResultPath: georefOf,
    passWithInputPath: 'Home',
    passWithInputPathAndResultPath: {
      georefOf: 'Home',
      place: 'Home'
    },
    // passWithNullInputPath: { },
    passWithNullInputPathAndResultPath: {
      georefOf: 'Home',
      place: { }
    },
    passWithResultAndNullOutputPath: { },
    passWithResultResultPathAndOutputPath: {
      'x-datum': 0,
      'y-datum': 600
    },
    passWithFixedParameters: {
      georefOf: 'Home',
      'x-datum': 0,
      'y-datum': 600
    },
    passWithFixedParametersAndResult: {
      georefOf: 'Home',
      'x-datum': 1000,
      'y-datum': 1600
    },
    passWithFixedParametersAndResultResultPath: {
      georefOf: 'Home',
      place: {
        'x-datum': 1000,
        'y-datum': 1600
      }
    },
    passWithFixedParametersAndNullOutputPath: { },
    passWithFixedParametersAndResultPath: {
      georefOf: 'Home',
      place: {
        'x-datum': 0,
        'y-datum': 600
      }
    },
    passWithFixedParametersResultPathAndOutputPath: {
      'x-datum': 0,
      'y-datum': 600
    },
    passWithFixedParametersResultResultPathAndOutputPath: {
      'x-datum': 1000,
      'y-datum': 1600
    },
    passWithDynamicParameters: {
      georefOf: 'Home',
      'x-datum': 0,
      'y-datum': 600,
      where: 'Home'
    },
    passWithDynamicParametersAndResult: {
      georefOf: 'Home',
      'x-datum': 1000,
      'y-datum': 1600
    },
    passWithDynamicParametersAndResultResultPath: {
      georefOf: 'Home',
      place: {
        'x-datum': 1000,
        'y-datum': 1600
      }
    },
    passWithDynamicParametersAndNullOutputPath: { },
    passWithDynamicParametersAndResultPath: {
      georefOf: 'Home',
      place: {
        'x-datum': 0,
        'y-datum': 600,
        where: 'Home'
      }
    },
    passWithDynamicParametersResultPathAndOutputPath: {
      'x-datum': 0,
      'y-datum': 600,
      where: 'Home'
    },
    passWithDynamicParametersResultResultPathAndOutputPath: {
      'x-datum': 1000,
      'y-datum': 1600
    }
  }

  for (const [name, result] of Object.entries(passStates)) {
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
    let executionDescription = await statebox.startExecution(
      Object.assign({}, input),
      statemachine,
      {} // options
    )

    executionDescription = await statebox.waitUntilStoppedRunning(executionDescription.executionName)

    expect(executionDescription.status).to.eql('SUCCEEDED')
    expect(executionDescription.stateMachineName).to.eql(statemachine)
    expect(executionDescription.currentStateName).to.eql('PassState')
    expect(executionDescription.currentResource).to.eql(undefined)
    expect(executionDescription.ctx).to.eql(result)
  }) // it ...
}
