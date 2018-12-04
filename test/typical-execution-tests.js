/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect
const DaosToTest = require('./daosToTest')

// Module Resources
const moduleResources = require('./fixtures/module-resources')

// stateMachines
const stateMachines = require('./fixtures/state-machines')

const Statebox = require('./../lib')

describe('Typical State Machine execution', () => {
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

      describe('helloWorld - state machine with a single state', () => {
        it('start', async () => {
          const executionDescription = await statebox.startExecution(
            {}, // input
            'helloWorld', // state machine name
            {} // options
          )

          executionName = executionDescription.executionName
        })

        it('waitUntilStopped', async () => {
          const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

          expect(executionDescription.status).to.eql('SUCCEEDED')
          expect(executionDescription.stateMachineName).to.eql('helloWorld')
          expect(executionDescription.currentStateName).to.eql('Hello World')
          expect(executionDescription.currentResource).to.eql('module:helloWorld')
        })
      })

      describe('helloThenWorld - state machine with two states', () => {
        it('startExecution', async () => {
          const executionDescription = await statebox.startExecution(
            {}, // input
            'helloThenWorld', // state machine name
            {} // options
          )

          executionName = executionDescription.executionName
        })

        it('waitUntilStoppedRunning', async () => {
          const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

          expect(executionDescription.status).to.eql('SUCCEEDED')
          expect(executionDescription.stateMachineName).to.eql('helloThenWorld')
          expect(executionDescription.currentStateName).to.eql('World')
          expect(executionDescription.currentResource).to.eql('module:world')
        })
      })

      describe('helloThenFailure, two state machine which fails in second state', () => {
        it('startExecution', async () => {
          const executionDescription = await statebox.startExecution(
            {}, // input
            'helloThenFailure', // state machine name
            {} // options
          )

          executionName = executionDescription.executionName
        })

        it('waitUntilStoppedRunning reports failure', async () => {
          const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

          expect(executionDescription.status).to.eql('FAILED')
          expect(executionDescription.stateMachineName).to.eql('helloThenFailure')
          expect(executionDescription.currentStateName).to.eql('Failure')
          expect(executionDescription.currentResource).to.eql('module:failure')
          expect(executionDescription.errorCode).to.eql('SomethingBadHappened')
          expect(executionDescription.errorMessage).to.eql('But at least it was expected')
        })
      })

      describe('helloThenWorldThroughException, four-state machine which fails mid-way but recovers via catching exceptions', () => {
        it('start', async () => {
          const executionDescription = await statebox.startExecution(
            {}, // input
            'helloThenWorldThroughException', // state machine name
            {} // options
          )

          expect(executionDescription.status).to.eql('RUNNING')
          executionName = executionDescription.executionName
        })

        it('waitUntilStoppedRunning', async () => {
          const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

          expect(executionDescription.status).to.eql('SUCCEEDED')
          expect(executionDescription.stateMachineName).to.eql('helloThenWorldThroughException')
          expect(executionDescription.currentStateName).to.eql('World')
          expect(executionDescription.currentResource).to.eql('module:world')
        })
      })

      describe('helloThenUncaughtFailure, a state machine that fails with an exception its error recovery does not catch', () => {
        it('startExecution', async () => {
          const executionDescription = await statebox.startExecution(
            {}, // input
            'helloThenUncaughtFailure', // state machine name
            {} // options
          )

          executionName = executionDescription.executionName
          expect(executionDescription.status).to.eql('RUNNING')
        })

        it('waitUntilStoppedRunning reports failure', async () => {
          const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

          expect(executionDescription.status).to.eql('FAILED')
          expect(executionDescription.stateMachineName).to.eql('helloThenUncaughtFailure')
          expect(executionDescription.currentStateName).to.eql('Failure')
          expect(executionDescription.currentResource).to.eql('module:failure')
          expect(executionDescription.errorCode).to.eql('SomethingBadHappened')
          expect(executionDescription.errorMessage).to.eql('But at least it was expected')
        })
      })

      describe('calculator - a state machine with choice state', () => {
        it('startExecution add', async () => {
          const executionDescription = await statebox.startExecution(
            {
              number1: 3,
              operator: '+',
              number2: 2
            }, // input
            'calculator', // state machine name
            {} // options
          )

          executionName = executionDescription.executionName
        })

        it('waitForStoppedRunning', async () => {
          const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

          expect(executionDescription.status).to.eql('SUCCEEDED')
          expect(executionDescription.stateMachineName).to.eql('calculator')
          expect(executionDescription.currentStateName).to.eql('Add')
          expect(executionDescription.currentResource).to.eql('module:add')
          expect(executionDescription.ctx.result).to.eql(5)
        })

        it('startExecution subtract', async () => {
          const executionDescription = await statebox.startExecution(
            {
              number1: 3,
              operator: '-',
              number2: 2
            }, // input
            'calculator', // state machine name
            {} // options
          )

          executionName = executionDescription.executionName
        })

        it('waitForStoppedRunning', async () => {
          const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

          expect(executionDescription.status).to.eql('SUCCEEDED')
          expect(executionDescription.stateMachineName).to.eql('calculator')
          expect(executionDescription.currentStateName).to.eql('Subtract')
          expect(executionDescription.currentResource).to.eql('module:subtract')
          expect(executionDescription.ctx.result).to.eql(1)
        })

        it('startExecution, with input paths', async () => {
          const executionDescription = await statebox.startExecution(
            {
              numbers: {
                number1: 3,
                number2: 2
              },
              operator: '-'
            }, // input
            'calculatorWithInputPaths', // state machine name
            {} // options
          )

          executionName = executionDescription.executionName
        })

        it('waitForStoppedRunning', async () => {
          const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

          expect(executionDescription.status).to.eql('SUCCEEDED')
          expect(executionDescription.stateMachineName).to.eql('calculatorWithInputPaths')
          expect(executionDescription.currentStateName).to.eql('Subtract')
          expect(executionDescription.currentResource).to.eql('module:subtract')
          expect(executionDescription.ctx.result).to.eql(1)
        })

        it('describeExecution', async () => {
          const executionDescription = await statebox.describeExecution(executionName)

          expect(executionDescription.status).to.eql('SUCCEEDED')
          expect(executionDescription.stateMachineName).to.eql('calculatorWithInputPaths')
          expect(executionDescription.currentStateName).to.eql('Subtract')
          expect(executionDescription.currentResource).to.eql('module:subtract')
          expect(executionDescription.ctx.result).to.eql(1)
        })
      })

      describe('startExecution with sendResponse: COMPLETE', () => {
        it('helloWorld succeeds', async () => {
          const executionDescription = await statebox.startExecution(
            {}, // input
            'helloWorld', // state machine name
            {
              sendResponse: 'COMPLETE'
            } // options
          )

          expect(executionDescription.status).to.eql('SUCCEEDED')
        })

        it('helloThenFailure fails', async () => {
          const executionDescription = await statebox.startExecution(
            {}, // input
            'helloThenFailure', // state machine name
            {
              sendResponse: 'COMPLETE'
            } // options
          )

          executionName = executionDescription.executionName
          expect(executionDescription.status).to.eql('FAILED')
        })
      })

      describe('non-existant executions', () => {
        it('waitUntilStoppedRunning fails', (done) => {
          statebox.waitUntilStoppedRunning('monkey-trousers')
            .then(() => done('should have thrown'))
            .catch(() => done())
        })
      })
    })
  })
})
