/* eslint-env mocha */

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const DaosToTest = require('./daosToTest')

// Module Resources
const moduleResources = require('./fixtures/module-resources')

// stateMachines
const stateMachines = require('./fixtures/state-machines')

const Statebox = require('./../lib')

describe('Reviving failed state machines', () => {
  DaosToTest.forEach(([name, options]) => {
    describe(`Using ${name}`, function () {
      this.timeout(process.env.TIMEOUT || 5000)
      let statebox
      let executionName

      before('setup statebox', async () => {
        statebox = new Statebox(options)
        await statebox.ready
        statebox.createModuleResources(moduleResources)
        await statebox.createStateMachines(
          stateMachines,
          {}
        )
      })

      describe('fail, come back to life, fail again', () => {
        it('start', async () => {
          const executionDescription = await statebox.startExecution(
            {}, // input
            'helloThenFailure', // state machine name
            {} // options
          )

          executionName = executionDescription.executionName
        })

        it('oh dear', async () => {
          const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

          expect(executionDescription.status).to.eql('FAILED')
          expect(executionDescription.stateMachineName).to.eql('helloThenFailure')
          expect(executionDescription.currentStateName).to.eql('Failure')
        })

        it('start heart beat', async () => {
          await statebox.sendTaskRevivification(
            executionName
          )
        })

        it('oh dear, still bad', async () => {
          const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

          expect(executionDescription.status).to.eql('FAILED')
          expect(executionDescription.stateMachineName).to.eql('helloThenFailure')
          expect(executionDescription.currentStateName).to.eql('Failure')
        })
      })

      describe('fail, come back to life, succeed', () => {
        it('start', async () => {
          const executionDescription = await statebox.startExecution(
            {}, // input
            'helloFailButLiveAgain', // state machine name
            {} // options
          )

          executionName = executionDescription.executionName
        })

        it('oh dear', async () => {
          const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

          expect(executionDescription.status).to.eql('FAILED')
          expect(executionDescription.stateMachineName).to.eql('helloFailButLiveAgain')
          expect(executionDescription.currentStateName).to.eql('Stuttery')
          expect(expect(executionDescription.executionOptions.error).to.eql({
            error: 'SomethingBadHappened',
            cause: 'But at least it was expected'
          }))
        })

        it('raise from the grave', async () => {
          await statebox.sendTaskRevivification(
            executionName
          )
        })

        it('it lives', async () => {
          const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

          expect(executionDescription.status).to.eql('SUCCEEDED')
          expect(executionDescription.stateMachineName).to.eql('helloFailButLiveAgain')
          expect(executionDescription.currentStateName).to.eql('IT-LIVES')
          expect(executionDescription.executionOptions.error).to.be.null()
        })
      })
    })
  })
})
