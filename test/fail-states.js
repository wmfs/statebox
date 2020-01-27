/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect

// stateMachines
const failStateMachines = require('./fixtures/state-machines/fail-state')

const Statebox = require('./../lib')

let statebox

describe('Fail states', function () {
  before('setup statebox', async () => {
    statebox = new Statebox()
    await statebox.ready
    await statebox.createStateMachines(failStateMachines, {})
  })

  it('fail state', async () => {
    const executionDescription = await statebox.startExecution(
      {},
      'fail', // state machine name
      {
        sendResponse: 'COMPLETED'
      } // options
    )

    expect(executionDescription.status).to.eql('FAILED')
    expect(executionDescription.stateMachineName).to.eql('fail')
    expect(executionDescription.currentStateName).to.eql('FailState')
    expect(executionDescription.currentResource).to.eql(undefined)
    expect(executionDescription.errorMessage).to.eql('Invalid response.')
    expect(executionDescription.errorCode).to.eql('ErrorA')
  })
})
