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

      before('setup statebox', async () => {
        statebox = new Statebox(options)
        await statebox.ready
        statebox.createModuleResources(moduleResources)
        await statebox.createStateMachines(
          stateMachines,
          {}
        )
      })

      before('setup webserver', done => {
        const app = express()
        server = app.listen(3003, done)
      })

      after('close up webserver', () => {
        server.close()
      })

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
          error: 'SomethingBadHappened',
          cause: 'But at least it was expected'
        })
      })

      it('error: string, cause: Error', async () => {
        const executionDescription = await run('errorCodeAndErrorObject')

        // Don't check error message because it can be either:
        // Cannot read properties of null (reading 'oh_dear')
        // Cannot read property 'oh_dear' of null

        expect(executionDescription.errorCode).to.eql('ExceptionHandler')
        expect(executionDescription.executionOptions.error.error).contains('ExceptionHandler')
        expect(executionDescription.executionOptions.error.stack).exist()
      })

      it('Error', async () => {
        const executionDescription = await run('errorException')

        expect(executionDescription.errorCode).to.eql('TypeError')
        expect(executionDescription.errorMessage).to.eql('obj.missingFn is not a function')
        expect(executionDescription.executionOptions.error).contains({
          error: 'TypeError',
          cause: 'obj.missingFn is not a function'
        })
        expect(executionDescription.executionOptions.error.stack).exist()
      })
      it('StatusCodeError - HTTP not found', async () => {
        const executionDescription = await run('errorHttpNotFound')

        expect(executionDescription.errorCode).to.eql('Error')
        expect(executionDescription.errorMessage).to.contain('404')
      })
      it('StatusCodeError - HTTP can\'t connect', async () => {
        const executionDescription = await run('errorHttpCantConnect')

        expect(executionDescription.errorCode).to.eql('Error')
        expect(executionDescription.errorMessage).to.eql('connect ECONNREFUSED 127.0.0.1:9999')
      })
    })
  })
})
