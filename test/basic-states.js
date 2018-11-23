/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect
const { DateTime, Duration } = require('luxon')

// Module Resources
const moduleResources = require('./fixtures/module-resources')

// stateMachines
const stateMachines = require('./fixtures/state-machines')

const Statebox = require('./../lib')

describe('State machines', function () {
  this.timeout(process.env.TIMEOUT || 5000)

  let statebox
  let executionName

  describe('set up', () => {
    it('create a new Statebox', async () => {
      statebox = new Statebox()
      await statebox.ready
    })

    it('add module resources', function () {
      statebox.createModuleResources(moduleResources)
    })

    it('add state machines', () => {
      return statebox.createStateMachines(
        stateMachines,
        {}
      )
    })
  })

  describe('fail state', () => {
    it('startExecution', async () => {
      const executionDescription = await statebox.startExecution(
        {},
        'fail', // state machine name
        {} // options
      )

      executionName = executionDescription.executionName
    })

    it('waitUntilStoppedRunning reports failure', async () => {
      const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

      expect(executionDescription.status).to.eql('FAILED')
      expect(executionDescription.stateMachineName).to.eql('fail')
      expect(executionDescription.currentStateName).to.eql('FailState')
      expect(executionDescription.currentResource).to.eql(undefined)
      expect(executionDescription.errorMessage).to.eql('Invalid response.')
      expect(executionDescription.errorCode).to.eql('ErrorA')
    })
  })

  describe('parallel', () => {
    describe('parallel - state machine with parallel states and results - run multiple times', () => {
      for (let i = 0; i < 3; i++) {
        it(`startExecution ${i}`, async () => {
          const executionDescription = await statebox.startExecution(
            { results: [] },
            'parallelResults',
            {}
          )

          executionName = executionDescription.executionName
        })

        it(`waitUntilStoppedRunning ${i}`, async () => {
          const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

          expect(executionDescription.status).to.eql('SUCCEEDED')
          expect(executionDescription.stateMachineName).to.eql('parallelResults')
          expect(executionDescription.currentStateName).to.eql('FG')
          expect(executionDescription.ctx.results).to.include('G')
          expect(executionDescription.ctx.results).to.include('F')
          expect(executionDescription.ctx.results).to.have.lengthOf(2)
        })
      }
    })

    describe('parallel - state machine with multiple parallel branches', () => {
      //
      //                        |
      //                    Parallel1
      //                    |       |
      //                    A       B
      //                (+4 secs)   |
      //                 |      Parallel2
      //                 |      |       |
      //                 |      C       D
      //                 |  (+2 secs)   |
      //                 |      |       E
      //                 |      |       |
      //                 |      ---------
      //                 |          |
      //                 |          F
      //                 |          |
      //                 ------------
      //                       |
      //                       G
      // Expected order [Parallel1, B, Parallel2, D, E, C, F, A, G ]
      it('startExecution', async () => {
        const executionDescription = await statebox.startExecution(
          {
            results: []
          },
          'parallel', // state machine name
          {} // options
        )

        executionName = executionDescription.executionName
      })

      it('waitUntilStoppedRunning', async () => {
        const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

        expect(executionDescription.status).to.eql('SUCCEEDED')
        expect(executionDescription.stateMachineName).to.eql('parallel')
        expect(executionDescription.currentStateName).to.eql('G')
        expect(executionDescription.currentResource).to.eql('module:g')
      })
    })

    describe('parallel-failing - state machine with multiple parallel branches with a failing branch', () => {
      it('startExecution', async () => {
        const executionDescription = await statebox.startExecution(
          {
            results: []
          },
          'parallelFail', // state machine name
          {} // options
        )

        executionName = executionDescription.executionName
      })

      it('waitUntilStoppedRunning reports failure', async () => {
        const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

        expect(executionDescription.status).to.eql('FAILED')
        expect(executionDescription.stateMachineName).to.eql('parallelFail')
        expect(executionDescription.currentStateName).to.eql('Parallel1')
        expect(executionDescription.currentResource).to.eql(undefined)
        expect(executionDescription.errorCause).to.eql('States.BranchFailed')
        expect(executionDescription.errorCode).to.eql('Failed because a state in a parallel branch has failed')
      })
    })
  })
})
