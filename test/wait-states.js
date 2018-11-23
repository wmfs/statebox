/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect
const { DateTime, Duration } = require('luxon')

// stateMachines
const passStateMachines = require('./fixtures/state-machines/wait-state')

const Statebox = require('./../lib')

let statebox

describe('Wait State', function () {
  before('setup statebox', async () => {
    statebox = new Statebox()
    await statebox.ready
    await statebox.createStateMachines(passStateMachines, {})
  })

  const waitStates = {
    waitWithSeconds: 0.2,
    waitWithSecondsPath: 0.5,
    waitWithTimestampPath: 0.6
  }
  for (const [name, delay] of Object.entries(waitStates)) {
    test(name, name, delay, delay)
  }

  it('waitWithTimestamp', async () => {
    const name = 'waitWithTimestamp'
    const delay = 0.5

    const waitWithTimestampSM = {
      Comment: 'A simple state machine to loop using the wait state',
      StartAt: 'Pause',
      States: {
        Pause: {
          Type: 'Wait',
          Timestamp: DateTime.local().plus(Duration.fromMillis(delay * 1000)).toISO(),
          End: true
        }
      }
    }

    await statebox.createStateMachines(
      {
        [name]: waitWithTimestampSM
      },
      {}
    )

    let executionDescription = await statebox.startExecution(
      {},
      name,
      {}
    )

    expect(executionDescription.stateMachineName).to.eql(name)
    expect(executionDescription.status).to.eql('RUNNING')

    executionDescription = await statebox.waitUntilStoppedRunning(executionDescription.executionName)

    const startedAt = DateTime.fromISO(executionDescription.startDate)
    const now = DateTime.local()
    const diff = now.diff(startedAt).as('seconds')
    expect(diff).to.be.above(delay)
    expect(executionDescription.status).to.eql('SUCCEEDED')
  })

  const waitStatesInThePast = [
    'waitWithSecondsPath',
    'waitWithTimestampPath',
    'waitWithTimestamp'
  ]
  for (const name of waitStatesInThePast) {
    test(`${name} in the past`, name, -10, 0)
  }
})

function test (label, stateMachine, delay, expectedDelay) {
  it(label, async () => {
    const waitUntil = DateTime.local().plus(Duration.fromMillis(delay * 1000))
    let executionDescription = await statebox.startExecution(
      {
        waitFor: delay,
        waitUntil: waitUntil.toISO()
      },
      stateMachine,
      {}
    )

    executionDescription = await statebox.waitUntilStoppedRunning(executionDescription.executionName)

    const startedAt = DateTime.fromISO(executionDescription.startDate)
    const now = DateTime.local()
    const diff = now.diff(startedAt).as('seconds')

    if (expectedDelay) {
      expect(diff).to.be.above(expectedDelay)
    } else {
      expect(Math.round(diff)).to.eql(0)
    }
    expect(executionDescription.status).to.eql('SUCCEEDED')
  })
}
