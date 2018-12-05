/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const DaosToTest = require('./daosToTest')

// Module Resources
const moduleResources = require('./fixtures/state-machines/parallel-state/resources')

// stateMachines
const parallelStateMachines = require('./fixtures/state-machines/parallel-state')

const Statebox = require('./../lib')

describe('Parallel State', function () {
  DaosToTest.forEach(([name, options]) => {
    describe(`Using ${name}`, function () {
      this.timeout(process.env.TIMEOUT || 5000)

      let statebox

      before('setup statebox', async () => {
        statebox = new Statebox(options)
        await statebox.ready
        statebox.createModuleResources(moduleResources)
        await statebox.createStateMachines(parallelStateMachines, {})
      })

      it('fun-with-math - example from spec', async () => {
        let executionDescription = await statebox.startExecution(
          [ 3, 2 ],
          'funWithMath', // state machine name
          {} // options
        )

        executionDescription = await statebox.waitUntilStoppedRunning(executionDescription.executionName)

        expect(executionDescription.status).to.eql('SUCCEEDED')
        expect(executionDescription.ctx[0]).to.equal(5)
        expect(executionDescription.ctx).to.eql([5, 1])
      })

      it('parallel - state machine with multiple parallel branches', async () => {
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
        let executionDescription = await statebox.startExecution(
          {},
          'parallel', // state machine name
          {} // options
        )

        executionDescription = await statebox.waitUntilStoppedRunning(executionDescription.executionName)

        expect(executionDescription.status).to.eql('SUCCEEDED')
        expect(executionDescription.stateMachineName).to.eql('parallel')
        expect(executionDescription.currentStateName).to.eql('G')
        expect(executionDescription.currentResource).to.eql('module:g')
      })

      it('parallel-failing - state machine with multiple parallel branches with a failing branch', async () => {
        let executionDescription = await statebox.startExecution(
          {
            results: []
          },
          'parallelFail', // state machine name
          {} // options
        )

        executionDescription = await statebox.waitUntilStoppedRunning(executionDescription.executionName)

        expect(executionDescription.status).to.eql('FAILED')
        expect(executionDescription.stateMachineName).to.eql('parallelFail')
        expect(executionDescription.currentStateName).to.eql('Parallel1')
        expect(executionDescription.currentResource).to.not.exist()
        expect(executionDescription.errorMessage).to.eql('States.BranchFailed')
        expect(executionDescription.errorCode).to.eql('Failed because a state in a parallel branch has failed')
      })

      describe('parallel - state machine with parallel states and results - run multiple times', () => {
        const names = []
        const lots = 50
        for (let i = 0; i !== lots; ++i) {
          it(`startExecution ${i}`, async () => {
            const executionDescription = await statebox.startExecution(
              { results: [] },
              'parallelResults',
              {}
            )

            names[i] = executionDescription.executionName
          })
        }

        for (let i = lots-1; i >= 0; --i) {
          it(`waitUntilStoppedRunning ${i}`, async () => {
            const executionDescription = await statebox.waitUntilStoppedRunning(names[i])

            expect(executionDescription.status).to.eql('SUCCEEDED')
            expect(executionDescription.stateMachineName).to.eql('parallelResults')
            expect(executionDescription.currentStateName).to.eql('FG')
            expect(executionDescription.ctx).to.eql(['F', 'G'])
          })
        }
      })
    })
  }) // DaosToTest
})
