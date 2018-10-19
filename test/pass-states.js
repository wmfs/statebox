/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

// stateMachines
const stateMachines = require('./fixtures/state-machines')

const Statebox = require('./../lib')

let statebox

describe('Pass State', function () {
  before('setup statebox', async () => {
    statebox = new Statebox()
    await statebox.ready
    await statebox.createStateMachines(stateMachines.pass, {})
  })

  const passStates = {
    pass: {
      georefOf: 'Home'
    },
    passWithResult: {
      georefOf: 'Home',
      'x-datum': 0,
      'y-datum': 600
    },
    passWithResultPath: {
      georefOf: 'Home'
    },
    passWithResultAndResultPath: {
      georefOf: 'Home',
      coords: {
        'x-datum': 0,
        'y-datum': 600
      }
    },
    passWithResultAndNullResultPath: {
      georefOf: 'Home'
    }/*,
    passWithResultAndNullOutputPath: {
    } */
  }

  for (const [name, result] of Object.entries(passStates)) {
    test(
      name,
      name,
      { georefOf: 'Home' },
      result
    )
  } // for ...
})

function test (label, statemachine, input, result) {
  it(label, async () => {
    let executionDescription = await statebox.startExecution(
      input,
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
