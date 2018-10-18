/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect

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
    it('create a new Statebox', function () {
      statebox = new Statebox()
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

    it('check states', () => {
      const states = statebox.findStates({ resourceToFind: 'module:hello' })
      expect(states.length).to.eql(8)

      const notfound = statebox.findStates({ resourceToFind: 'module:dummy' })
      expect(notfound.length).to.eql(0)
    })
  })

  describe('pass state', () => {
    const passStates = {
      pass: {
        georefOf: 'Home',
      },
      passWithResult: {
        georefOf: 'Home',
        'x-datum': 0,
        'y-datum': 600
      },
      passWithResultPath: {
        georefOf: 'Home',
      },
      passWithResultAndResultPath: {
        georefOf: 'Home',
        coords: {
          'x-datum': 0,
          'y-datum': 600
        }
      }
    }

    for (const [name, result] of Object.entries(passStates)) {
      describe(name, () => {
        it('startExecution', async () => {
          const executionDescription = await statebox.startExecution(
            {
              georefOf: 'Home'
            },
            name,
            {} // options
          )

          executionName = executionDescription.executionName
        })

        it('waitUntilStoppedRunning', async () => {
          const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

          expect(executionDescription.status).to.eql('SUCCEEDED')
          expect(executionDescription.stateMachineName).to.eql(name)
          expect(executionDescription.currentStateName).to.eql('PassState')
          expect(executionDescription.currentResource).to.eql(undefined)
          expect(executionDescription.ctx).to.eql(result)
        })
      }) // describe
    } // for ...
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

  describe('succeed state', () => {
    it('startExecution', async () => {
      const executionDescription = await statebox.startExecution(
        {},
        'succeed', // state machine name
        {} // options
      )

      executionName = executionDescription.executionName
    })

    it('waitUntilStoppedRunning reports success', async () => {
      const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

      expect(executionDescription.status).to.eql('SUCCEEDED')
      expect(executionDescription.stateMachineName).to.eql('succeed')
      expect(executionDescription.currentStateName).to.eql('SucceedState')
      expect(executionDescription.currentResource).to.eql(undefined)
    })
  })

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

  describe('wait state', () => {
    it('startExecution', async () => {
      const executionDescription = await statebox.startExecution(
        {},
        'waitState',
        {}
      )

      expect(executionDescription.stateMachineName).to.eql('waitState')
      expect(executionDescription.status).to.eql('RUNNING')
      executionName = executionDescription.executionName
    })

    it('verify elapsed time', async () => {
      const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

      const diff = new Date().getTime() - new Date(executionDescription.startDate).getTime()
      expect(diff).to.be.above(3000)
      expect(executionDescription.status).to.eql('SUCCEEDED')
    })
  })
})
