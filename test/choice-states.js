/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

// stateMachines
const choiceStateMachines = require('./fixtures/state-machines/choice-state')

const Statebox = require('./../lib')

let statebox

describe('Choice State', function () {
  before('setup statebox', async () => {
    statebox = new Statebox()
    await statebox.ready
    await statebox.createStateMachines(choiceStateMachines, {})
  })

  const choiceStates = [ 'choice', 'choiceWithInputPath' ]

  const branches = [
    [ 'first', { calc: { operator: '+' } }, { calc: { operator: '+' }, result: 'add' } ],
    [ 'second', { calc: { operator: '-' } }, { calc: { operator: '-' }, result: 'subtract' } ]
  ]

  for (const machine of choiceStates) {
    for (const [branch, input, result] of branches) {
      test(
        `${machine} - ${branch} branch`,
        machine,
        input,
        result
      )
    } // for ...
  }
})

function test (label, statemachine, input, result) {
  it(label, async () => {
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
