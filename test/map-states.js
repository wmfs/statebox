/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

const DaosToTest = require('./daosToTest')

const moduleResources = require('./fixtures/module-resources')
const mapStateMachines = require('./fixtures/state-machines/map-state')

const Statebox = require('./../lib')

describe('Map State', function () {
  DaosToTest.forEach(([name, options]) => {
    describe(`Using ${name}`, function () {
      this.timeout(process.env.TIMEOUT || 5000)

      let statebox

      before('setup statebox', async () => {
        statebox = new Statebox()
        await statebox.ready
        statebox.createModuleResources(moduleResources)
        await statebox.createStateMachines(mapStateMachines, {})
      })

      const tests = [
        [
          'map',
          {
            'ship-date': '2016-03-14T01:59:00Z',
            detail: {
              'delivery-partner': 'UQS',
              shipped: [
                { prod: 'R31', 'dest-code': 9511, quantity: 1344 },
                { prod: 'S39', 'dest-code': 9511, quantity: 40 },
                { prod: 'R31', 'dest-code': 9833, quantity: 12 },
                { prod: 'R40', 'dest-code': 9860, quantity: 887 },
                { prod: 'R40', 'dest-code': 9511, quantity: 1220 }
              ]
            }
          },
          {
            'ship-date': '2016-03-14T01:59:00Z',
            detail: {
              'delivery-partner': 'UQS',
              shipped: [
                { prod: 'R31', 'dest-code': 9511, quantity: 1345 },
                { prod: 'S39', 'dest-code': 9511, quantity: 41 },
                { prod: 'R31', 'dest-code': 9833, quantity: 13 },
                { prod: 'R40', 'dest-code': 9860, quantity: 888 },
                { prod: 'R40', 'dest-code': 9511, quantity: 1221 }
              ]
            }
          }
        ]
      ]

      for (const [statemachine, input, result] of tests) {
        it(statemachine, async () => {
          let executionDescription = await statebox.startExecution(
            Object.assign({}, input),
            statemachine,
            {} // options
          )

          executionDescription = await statebox.waitUntilStoppedRunning(executionDescription.executionName)

          expect(executionDescription.status).to.eql('SUCCEEDED')
          expect(executionDescription.stateMachineName).to.eql(statemachine)
          expect(executionDescription.currentResource).to.eql(undefined)

          expect(executionDescription.ctx).to.eql(result)
        }) // it ...
      }
    })
  })
}) // DaosToTest
