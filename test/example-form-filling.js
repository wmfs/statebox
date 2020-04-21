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

describe('Form-filling', () => {
  DaosToTest.forEach(([name, options]) => {
    describe(`Using ${name}`, function () {
      this.timeout(process.env.TIMEOUT || 5000)
      const statebox = new Statebox(options)
      let executionName

      before('setup statebox', async () => {
        await statebox.ready
        statebox.createModuleResources(moduleResources)
        await Promise.all(
          Object.entries(stateMachines)
            .map(([name, definition]) => statebox.createStateMachine(name, definition, {}))
        )
      })

      describe('successfully fill in a form', () => {
        it('start form-filling state machine', async () => {
          const executionDescription = await statebox.startExecution(
            {}, // input
            'formFilling', // state machine name
            {} // options
          )

          executionName = executionDescription.executionName
        })

        it('wait', function (done) {
          setTimeout(done, 250)
        })

        it('state machine is running (i.e. waiting for an external heartbeat update)', async () => {
          const executionDescription = await statebox.describeExecution(executionName)

          expect(executionDescription.status).to.eql('RUNNING')
          expect(executionDescription.ctx).to.eql({ formId: 'fillThisFormInHuman!' })
          expect(executionDescription.stateMachineName).to.eql('formFilling')
        })

        it('send in a heartbeat update (i.e. some part-filled form data)', async () => {
          const execDesc = await statebox.sendTaskHeartbeat(
            executionName,
            {
              some: 'payload'
            }
          )

          expect(execDesc.status).to.eql('RUNNING')
        })

        it('wait again', function (done) {
          setTimeout(done, 250)
        })

        it('heartbeat context has been updated', async () => {
          const executionDescription = await statebox.describeExecution(executionName)

          expect(executionDescription.status).to.eql('RUNNING')
          expect(executionDescription.ctx.some).to.eql('payload')
          expect(executionDescription.stateMachineName).to.eql('formFilling')
        })

        it('sendTaskSuccess (i.e. some completed form data)', () => {
          return statebox.sendTaskSuccess(
            executionName,
            {
              formData: {
                name: 'Rupert'
              }
            } // output
          )
        })

        it('form-filling completed', async () => {
          const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

          expect(executionDescription.status).to.eql('SUCCEEDED')
          expect(executionDescription.stateMachineName).to.eql('formFilling')
          expect(executionDescription.currentStateName).to.eql('World')
          expect(executionDescription.currentResource).to.eql('module:world')
          expect(executionDescription.ctx).to.eql(
            {
              formData: {
                name: 'Rupert'
              },
              formId: 'fillThisFormInHuman!',
              some: 'payload'
            }
          )
        })
      })

      describe('form filling failure', () => {
        it('start form-filling state machine', async () => {
          const executionDescription = await statebox.startExecution(
            {}, // input
            'formFilling', // state machine name
            {} // options
          )

          executionName = executionDescription.executionName
        })

        it('wait', function (done) {
          setTimeout(done, 250)
        })

        it('state machine is running (i.e. waiting for an external update)', async () => {
          const executionDescription = await statebox.describeExecution(executionName)

          expect(executionDescription.status).to.eql('RUNNING')
          expect(executionDescription.ctx).to.eql({ formId: 'fillThisFormInHuman!' })
          expect(executionDescription.stateMachineName).to.eql('formFilling')
        })

        it('sendTaskFailure', async () => {
          const execDesc = await statebox.sendTaskFailure(
            executionName,
            {
              error: 'BIGFAIL',
              cause: 'Due to some bad thing happening'
            }
          )

          expect(execDesc.status).to.eql('FAILED')
        })

        it('form-filling in failed state', async () => {
          const executionDescription = await statebox.waitUntilStoppedRunning(executionName)

          expect(executionDescription.status).to.eql('FAILED')
          expect(executionDescription.stateMachineName).to.eql('formFilling')
          expect(executionDescription.currentStateName).to.eql('FormFilling')
          expect(executionDescription.currentResource).to.eql('module:formFilling')
          expect(executionDescription.ctx).to.eql({ formId: 'fillThisFormInHuman!' })
        })
      })

      describe('cancel form-filling', () => {
        it('start form-filling state machine', async () => {
          const executionDescription = await statebox.startExecution(
            {}, // input
            'formFilling', // state machine name
            {
              sendResponse: 'AFTER_RESOURCE_CALLBACK.TYPE:formFilling'
            } // options
          )

          executionName = executionDescription.executionName
          expect(executionDescription.status).to.eql('RUNNING')
          expect(executionDescription.stateMachineName).to.eql('formFilling')
          expect(executionDescription.currentStateName).to.eql('FormFilling')
          expect(executionDescription.currentResource).to.eql('module:formFilling')
        })

        it('stopExecution (i.e. simulates a user clicking cancel on this execution)', async () => {
          await statebox.stopExecution(
            'Form flow cancelled by user',
            'CANCELLED',
            executionName,
            {}
          )
        })

        it('form-filling is stopped (i.e. cancelled by a user)', async () => {
          const executionDescription = await statebox.describeExecution(executionName)

          expect(executionDescription.status).to.eql('STOPPED')
          expect(executionDescription.ctx).to.eql({ formId: 'fillThisFormInHuman!' })
          expect(executionDescription.stateMachineName).to.eql('formFilling')
        })

        it('reject sendTaskSuccess on a stopped state machine', (done) => {
          statebox.sendTaskSuccess(
            executionName,
            {
              formData: {
                name: 'Rupert'
              }
            } // output
          )
            .then(() => done('Expected an exception'))
            .catch(() => done())
        })

        it('sendTaskFailure on a stopped state machine', (done) => {
          statebox.sendTaskFailure(
            executionName,
            {
              formData: {
                name: 'Rupert'
              }
            }
          )
            .then(() => done(new Error('expected an error')))
            .catch(() => done())
        })

        it('sendTaskHeartbeat on a stopped state machine', (done) => {
          statebox.sendTaskHeartbeat(
            executionName,
            {
              formData: {
                name: 'Rupert'
              }
            } // executionOptions
          )
            .then(() => done(new Error('expected an error')))
            .catch(() => done())
        })
      })
    })
  })
})
