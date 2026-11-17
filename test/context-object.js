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
    FormattedDayOfWeek: { day: `Today is ${today}` },
    StartTime: eD => { return { startedAt: eD.startDate } },
    Time: eD => {
      expect(eD.ctx.time).to.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      return eD.ctx
    },
    Date: eD => {
      expect(eD.ctx.date).to.match(/^\d\d\/\d\d\/\d\d\d\d$/)
      return eD.ctx
    }
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

    const expected = (typeof result !== 'function') ? result : result(executionDescription)
    expect(executionDescription.ctx).to.eql(expected)
  }) // it ...
}

function runStateMachine (statemachine) {
  return statebox.startExecution(
    {}, // input
    statemachine,
    { sendResponse: 'COMPLETE' } // options
  )
}
