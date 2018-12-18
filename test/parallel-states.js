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

      describe('parallel state machines', () => {
        const tests = [
          {
            label: 'fun-with-math - example from spec',
            stateMachine: 'funWithMath',
            input: [ 3, 2 ],
            expected: [ 5, 1 ]
          },
          {
            label: 'fun-with-math-with-output-path',
            stateMachine: 'funWithMathWithOutputPath',
            input: [ 3, 2 ],
            expected: 5
          },
          {
            label: 'parallelling up',
            stateMachine: 'parallellingUp',
            input: { },
            expected: [ 'A', [ 'B', [ 'C', [ 'D', [ 'E', [ 'F', [ 'G' ] ] ] ] ] ] ]
          },
          {
            label: 'parallelling down',
            stateMachine: 'parallellingDown',
            input: { },
            expected: [ [ [ [ [ [ [ 'A' ], 'B' ], 'C' ], 'D' ], 'E' ], 'F' ], 'G' ]
          },
          {
            label: 'paralleling up and down',
            stateMachine: 'parallellingUpAndDown',
            input: { },
            expected: [ 'A', [ 'B', [ 'C', [ 'D' ], 'E' ], 'F' ], 'G' ]
          }
        ]

        for (const test of tests) {
          it(test.label, async () => {
            let executionDescription = await statebox.startExecution(
              test.input,
              test.stateMachine, // state machine name
              {} // options
            )

            executionDescription = await statebox.waitUntilStoppedRunning(executionDescription.executionName)

            expect(executionDescription.status).to.eql('SUCCEEDED')
            expect(executionDescription.ctx).to.eql(test.expected)
          })
        } // for ...

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
      })

      describe('parallel state machines with failing branches', () => {
        const failTests = [
          {
            label: 'parallel-failing',
            stateMachine: 'parallelFail',
            code: 'States.BranchFailed'
          },
          {
            label: 'parallelling up fail',
            stateMachine: 'parallellingUpFail',
            code: 'States.BranchFailed'
          },
          {
            label: 'parallelling down fail',
            stateMachine: 'parallellingDownFail',
            code: 'States.BranchFailed'
          },
          {
            label: 'paralleling up and down fail',
            stateMachine: 'parallellingUpAndDownFail',
            code: 'States.BranchFailed'
          },
          {
            label: 'parallelling up fail and catch',
            stateMachine: 'parallellingUpFailCatch',
            code: 'Oh No'
          },
          {
            label: 'parallelling down fail and catch',
            stateMachine: 'parallellingDownFailCatch',
            code: 'Oh No'
          },
          {
            label: 'paralleling up and down fail and catch',
            stateMachine: 'parallellingUpAndDownFailCatch',
            code: 'Oh No'
          }
        ]

        for (const test of failTests) {
          it(test.label, async () => {
            let executionDescription = await statebox.startExecution(
              {},
              test.stateMachine, // state machine name
              {} // options
            )

            executionDescription = await statebox.waitUntilStoppedRunning(executionDescription.executionName)

            expect(executionDescription.status).to.eql('FAILED')
            expect(executionDescription.currentResource).to.not.exist()
            expect(executionDescription.errorCode).to.eql(test.code)
          })
        } // for ...
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

        for (let i = lots - 1; i >= 0; --i) {
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
