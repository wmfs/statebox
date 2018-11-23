/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

// stateMachines
const failStateMachine = require('./fixtures/state-machines/fail-state')

const Statebox = require('./../lib')

let statebox

describe('Fail State', function () {
  before('setup statebox', async () => {
    statebox = new Statebox()
    await statebox.ready
    await statebox.createStateMachines(failStateMachine, {})
  })

  it('fail', async () => {
    let executionDescription = await statebox.startExecution(
      {},
      'fail', // state machine name
      {} // options
    )

    executionDescription = await statebox.waitUntilStoppedRunning(executionDescription.executionName)

    expect(executionDescription.status).to.eql('FAILED')
    expect(executionDescription.stateMachineName).to.eql('fail')
    expect(executionDescription.currentStateName).to.eql('FailState')
    expect(executionDescription.currentResource).to.eql(undefined)
    expect(executionDescription.errorMessage).to.eql('Invalid response.')
    expect(executionDescription.errorCode).to.eql('ErrorA')
  })
})
