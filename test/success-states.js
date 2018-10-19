/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

const succeedStateMachines = require('./fixtures/state-machines/succeed-state')

const Statebox = require('./../lib')

let statebox

describe('Success State', function () {
  before('setup statebox', async () => {
    statebox = new Statebox()
    await statebox.ready
    await statebox.createStateMachines(succeedStateMachines, {})
  })

  const address = {
    line1: 'Hescwm Uchaf',
    line2: 'Dinas Cross',
    postCode: 'SA42 0XL'
  }
  const blobOfStuff = {
    person: {
      name: 'Bill',
      address: address
    }
  }

  const passStates = {
    succeed: blobOfStuff
    // succeedWithInputPath: address,
    // succeedWithNullInputPath: { },
  }

  for (const [name, result] of Object.entries(passStates)) {
    test(
      name,
      name,
      blobOfStuff,
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
    expect(executionDescription.currentStateName).to.eql('SucceedState')
    expect(executionDescription.currentResource).to.eql(undefined)
    expect(executionDescription.ctx).to.eql(result)
  }) // it ...
}
