/* eslint-env mocha */

const chai = require('chai')
chai.use(require('dirty-chai'))
chai.use(require('chai-string'))
const expect = chai.expect
const DaosToTest = require('./daosToTest')
const express = require('express')

// Module Resources
const moduleResources = require('./fixtures/module-resources')

// stateMachines
const stateMachines = require('./fixtures/state-machines')

const Statebox = require('./../lib')

describe('Task failure handling', () => {
  DaosToTest.forEach(([name, options]) => {
    describe(`Using ${name}`, function () {
      this.timeout(process.env.TIMEOUT || 5000)
      let statebox
      let server

      describe('set up', () => {
        it('create a new Statebox', function () {
          statebox = new Statebox(options)
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

        it('start webserver', done => {
          const app = express()
          server = app.listen(3003, done)
        })
      })

      describe('failure cases', () => {
        const run = async execName => {
          const executionDescription = await statebox.startExecution(
            {}, // input
            execName,
            {
              sendResponse: 'COMPLETE'
            } // options
          )

          expect(executionDescription.status).to.eql('FAILED')
          return executionDescription
        }

        it('error: string, cause: string', async () => {
          const executionDescription = await run('errorCodeAndMessage')

          expect(executionDescription.errorCode).to.eql('SomethingBadHappened')
          expect(executionDescription.errorMessage).to.eql('But at least it was expected')
          expect(executionDescription.executionOptions.error).to.eql({
            'error': 'SomethingBadHappened',
            'cause': 'But at least it was expected'
          })
        })

        it('error: string, cause: Error', async () => {
          const executionDescription = await run('errorCodeAndErrorObject')

          expect(executionDescription.errorCode).to.eql('ExceptionHandler')
          expect(executionDescription.errorMessage).to.eql('Cannot read property \'oh_dear\' of null')
          expect(executionDescription.executionOptions.error).contains({
            'error': 'ExceptionHandler',
            'cause': 'Cannot read property \'oh_dear\' of null'
          })
          expect(executionDescription.executionOptions.error.stack).exist()
        })

        it('Error', async () => {
          const executionDescription = await run('errorException')

          expect(executionDescription.errorCode).to.eql('TypeError')
          expect(executionDescription.errorMessage).to.eql('obj.missingFn is not a function')
          expect(executionDescription.executionOptions.error).contains({
            'error': 'TypeError',
            'cause': 'obj.missingFn is not a function'
          })
          expect(executionDescription.executionOptions.error.stack).exist()
        })
        it('StatusCodeError - HTTP not found', async () => {
          const executionDescription = await run('errorHttpNotFound')

          expect(executionDescription.errorCode).to.eql('StatusCodeError')
          expect(executionDescription.errorMessage).to.startWith('404 -')
          expect(executionDescription.executionOptions.error).contains({
            'error': 'StatusCodeError',
            'statusCode': 404
          })
          expect(executionDescription.executionOptions.error.options).exist()
          expect(executionDescription.executionOptions.error.response).exist()
          expect(executionDescription.executionOptions.error.stack).not.exist()
        })
        it('StatusCodeError - HTTP can\'t connect', async () => {
          const executionDescription = await run('errorHttpCantConnect')

          expect(executionDescription.errorCode).to.eql('RequestError')
          expect(executionDescription.errorMessage).to.eql('Error: connect ECONNREFUSED 127.0.0.1:9999')
          expect(executionDescription.executionOptions.error).contains({
            'error': 'RequestError',
            'cause': 'Error: connect ECONNREFUSED 127.0.0.1:9999'
          })
          expect(executionDescription.executionOptions.error.options).not.exist()
          expect(executionDescription.executionOptions.error.response).not.exist()
          expect(executionDescription.executionOptions.error.stack).exist()
        })
      })

      describe('clean up', () => {
        it('close up webserver', () => {
          server.close()
        })
      })
    })
  })
})
