/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect
const fail = chai.assert.fail

const TestMachines = {
  HelloWorld: {
    Comment: 'A simple minimal example of the States language',
    StartAt: 'Hello World',
    States: {
      'Hello World': {
        Type: 'Task',
        Resource: 'testbox:helloWorld',
        End: true
      }
    }
  }
}

const Statebox = require('./../lib')

let statebox

describe('StateBox with Additional Resource Type', function () {
  it('setup statebox without additional resolver', async () => {
    statebox = new Statebox()
    await statebox.ready

    let created = false
    try {
      await statebox.createStateMachines(TestMachines, {})
      created = true
    } catch (err) {
      expect(err.message).to.have.string('Unknown resource type \'testbox\'')
    }

    if (created) {
      fail('Should have exploded with unknown resource type')
    }
  })

  function testBoxResolver () {
    return {
      init: () => { },
      run: (input, context) => {
        context.sendTaskSuccess('Hello from TestBox')
      }
    }
  }

  it('setup statebox with resolver', async () => {
    statebox = new Statebox()
    await statebox.ready
    statebox.registerResourceResolver('testbox', testBoxResolver)
    await statebox.createStateMachines(TestMachines, {})
  })

  it('Run additional resource', async () => {
    const executionDescription = await runStateMachine('HelloWorld', {})

    expect(executionDescription.status).to.eql('SUCCEEDED')
    expect(executionDescription.stateMachineName).to.eql('HelloWorld')
    expect(executionDescription.currentStateName).to.eql('Hello World')
    expect(executionDescription.currentResource).to.eql('testbox:helloWorld')
    expect(executionDescription.ctx).to.eql('Hello from TestBox')
  }) // it ...
})

async function runStateMachine (statemachine, input) {
  const executionDescription = await statebox.startExecution(
    Object.assign({}, input),
    statemachine,
    {} // options
  )

  return statebox.waitUntilStoppedRunning(executionDescription.executionName)
}
