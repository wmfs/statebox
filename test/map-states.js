/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

const moduleResources = require('./fixtures/module-resources')
const mapStateMachines = require('./fixtures/state-machines/map-state')

const Statebox = require('./../lib')

let statebox

describe('Map State', function () {
  this.timeout(process.env.TIMEOUT || 5000)

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
      {}
    ]
  ]

  for (const [statemachine, input, result] of tests) {
    test(
      statemachine,
      input,
      result
    )
  }
})

function test (statemachine, input, result) {
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

    // Quantity incremented by 1
    expect(executionDescription.ctx.detail.shipped[0].quantity).to.eql(1345)
    expect(executionDescription.ctx.detail.shipped[1].quantity).to.eql(41)
    expect(executionDescription.ctx.detail.shipped[2].quantity).to.eql(13)
    expect(executionDescription.ctx.detail.shipped[3].quantity).to.eql(888)
    expect(executionDescription.ctx.detail.shipped[4].quantity).to.eql(1221)
  }) // it ...
}
