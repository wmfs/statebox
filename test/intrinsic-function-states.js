/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

const intrinsicStateMachines = require('./fixtures/state-machines/intrinsic-function-state')

const Statebox = require('./../lib')

let statebox

describe('Intrinsic Function States', function () {
  this.timeout(process.env.TIMEOUT || 5000)

  before('setup statebox', async () => {
    statebox = new Statebox()
    await statebox.ready
    await statebox.createStateMachines(intrinsicStateMachines, {})
  })

  const tests = [
    [
      'stringToJson',
      { someString: '{"hello":"world"}' },
      { foo: { hello: 'world' }, someString: '{"hello":"world"}' }
    ],
    [
      'jsonToString',
      { someJson: { name: 'Foo', year: 2020 }, zebra: 'stripe' },
      { foo: '{"name":"Foo","year":2020}', someJson: { name: 'Foo', year: 2020 }, zebra: 'stripe' }
    ],
    [
      'format',
      { name: 'Homer' },
      { foo: 'Your name is Homer, we are in the year 2020', name: 'Homer' }
    ],
    [
      'array',
      { someJson: { random: 'abcdefg' }, zebra: 'stripe' },
      { foo: ['Foo', 2020, { random: 'abcdefg' }, null], someJson: { random: 'abcdefg' }, zebra: 'stripe' }
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
    expect(executionDescription.ctx).to.eql(result)
  }) // it ...
}
