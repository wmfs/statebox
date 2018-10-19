/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

// stateMachines
const stateMachines = require('./fixtures/state-machines')

const Statebox = require('./../lib')

describe('Pass State', function () {
  this.timeout(process.env.TIMEOUT || 5000)

  let statebox

  before(async () => {
    statebox = new Statebox()
    await statebox.createStateMachines(stateMachines.pass, {})
  })

  describe('pass state', () => {
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
      it(name, async () => {
        let executionDescription = await statebox.startExecution(
          {
            georefOf: 'Home'
          },
          name,
          {} // options
        )

        executionDescription = await statebox.waitUntilStoppedRunning(executionDescription.executionName)

        expect(executionDescription.status).to.eql('SUCCEEDED')
        expect(executionDescription.stateMachineName).to.eql(name)
        expect(executionDescription.currentStateName).to.eql('PassState')
        expect(executionDescription.currentResource).to.eql(undefined)
        expect(executionDescription.ctx).to.eql(result)
      }) // it ...
    } // for ...
  })
})
