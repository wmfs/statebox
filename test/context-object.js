/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

const contextObjectStateMachines = require('./fixtures/state-machines/context-object')

const Statebox = require('./../lib')

let statebox

describe('Context Object', () => {
  before('setup statebox', async () => {
    statebox = new Statebox()
    await statebox.ready
    await statebox.createStateMachines(contextObjectStateMachines, {})
  })

  const today = new Date().toLocaleDateString('en-EN', { weekday: 'long' })

  const contextObjectStates = {
    NonExistantProperty: { oops: null },
    DayOfWeek: { day: today },
    FormattedDayOfWeek: { day: `Today is ${today}` }
  }

  for (const [name, result] of Object.entries(contextObjectStates)) {
    test(name, result)
  }
})

function test (statemachine, result) {
  it(statemachine, async () => {
    const executionDescription = await runStateMachine(statemachine)

    expect(executionDescription.status).to.eql('SUCCEEDED')
    expect(executionDescription.stateMachineName).to.eql(statemachine)
    expect(executionDescription.currentResource).to.eql(undefined)
    expect(executionDescription.ctx).to.eql(result)
  }) // it ...
}

function runStateMachine (statemachine) {
  return statebox.startExecution(
    {}, // input
    statemachine,
    { sendResponse: 'COMPLETE' } // options
  )
}
