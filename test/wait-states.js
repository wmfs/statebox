/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect
const { DateTime, Duration } = require('luxon')

// stateMachines
const waitStateMachines = require('./fixtures/state-machines/wait-state')

class Now {
  run (event, context) {
    console.log(DateTime.local().toISO())
    context.sendTaskSuccess()
  }
}
const newResource = { now: Now }

const Statebox = require('./../lib')

let statebox

describe('Wait States', function () {
  this.timeout(process.env.TIMEOUT || 5000)

  before('setup statebox', async () => {
    statebox = new Statebox()
    await statebox.ready
    statebox.createModuleResources(newResource)
    await statebox.createStateMachines(waitStateMachines, {})
    const name = 'waitWithTimestamp'
    const delay = 2

    const waitWithTimestampSM = {
      Comment: 'A simple state machine to loop using the wait state',
      StartAt: 'Hello',
      States: {
        Hello: {
          Type: 'Task',
          Resource: 'module:now',
          Next: 'Pause'
        },
        Pause: {
          Type: 'Wait',
          Timestamp: DateTime.local().plus(Duration.fromMillis(delay * 1000)).toISO(),
          Next: 'Hello2'
        },
        Hello2: {
          Type: 'Task',
          Resource: 'module:now',
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
  })

  const waitStates = {
    waitWithTimestamp: 2,
    waitWithSeconds: 2,
    waitWithSecondsPath: 3,
    waitWithTimestampPath: 4
  }

  for (const [name, delay] of Object.entries(waitStates)) {
    it(name, async () => {
      const waitUntil = DateTime.local().plus(Duration.fromMillis(delay * 1000))
      let executionDescription = await statebox.startExecution(
        {
          waitFor: 3,
          waitUntil: waitUntil.toISO()
        },
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
  } // for ...

  const waitStatesInThePast = [
    'waitWithSecondsPath',
    'waitWithTimestampPath',
    'waitWithTimestamp'
  ]
  for (const name of waitStatesInThePast) {
    it(`${name} with value in the past`, async () => {
      let executionDescription = await statebox.startExecution(
        {
          waitFor: -3,
          waitUntil: '2018-10-18T10:15:00Z'
        },
        name,
        {}
      )

      expect(executionDescription.stateMachineName).to.eql(name)
      expect(executionDescription.status).to.eql('RUNNING')

      executionDescription = await statebox.waitUntilStoppedRunning(executionDescription.executionName)

      const startedAt = DateTime.fromISO(executionDescription.startDate)
      const now = DateTime.local()
      const diff = Math.round(now.diff(startedAt).as('seconds'))
      expect(diff).to.eql(0)
      expect(executionDescription.status).to.eql('SUCCEEDED')
    })
  } // for ...
})
