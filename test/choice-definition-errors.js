/* eslint-env mocha */

// Invalid Choice states are rejected when state machines are created, and
// the error says which state machine and state the problem is in.

const chai = require('chai')
const expect = chai.expect

const Statebox = require('./../lib')

function choiceMachine (choiceState) {
  return {
    StartAt: 'Decide',
    States: {
      Decide: { Type: 'Choice', ...choiceState },
      Done: { Type: 'Succeed' }
    }
  }
}

describe('Choice state definition errors', function () {
  let statebox

  before('setup statebox', async () => {
    statebox = new Statebox()
    await statebox.ready
  })

  async function createError (stateMachines) {
    try {
      await statebox.createStateMachines(stateMachines, {})
    } catch (e) {
      return e
    }
    throw new Error('expected createStateMachines to reject')
  }

  it('names the state machine and state', async () => {
    const err = await createError({
      launchForm: choiceMachine({
        Choices: [
          { Variable: '$.delayValid', BooleanEquals: true, Next: 'Done' },
          { Variable: '$.delayValid', StringEquals: false, Next: 'Done' }
        ],
        Default: 'Done'
      })
    })

    expect(err.name).to.equal('ChoiceDefinitionError')
    expect(err.message).to.equal(
      "Invalid Choice state 'Decide' in state machine 'launchForm': Choices[1]: StringEquals must be a string, got false"
    )
    expect(err.stateMachineName).to.equal('launchForm')
    expect(err.stateName).to.equal('Decide')
    expect(err.cause.name).to.equal('ChoiceDefinitionError')
  })

  it('names Choice states inside Parallel branches', async () => {
    const err = await createError({
      withBranches: {
        StartAt: 'P',
        States: {
          P: {
            Type: 'Parallel',
            Branches: [choiceMachine({ Choices: [{ Variable: 'type', StringEquals: 'INITIAL', Next: 'Done' }] })],
            End: true
          }
        }
      }
    })

    expect(err.name).to.equal('ChoiceDefinitionError')
    expect(err.message).to.match(/^Invalid Choice state 'Decide' in state machine 'withBranches[^']*': Choices\[0\]: Variable must be a Path/)
  })

  it('still creates valid Choice states', async () => {
    await statebox.createStateMachines({
      validChoice: choiceMachine({ Choices: [{ Variable: '$.n', NumericGreaterThan: 3, Next: 'Done' }], Default: 'Done' })
    }, {})
    const execution = await statebox.startExecution({ n: 5 }, 'validChoice', {})
    const result = await statebox.waitUntilStoppedRunning(execution.executionName)
    expect(result.status).to.equal('SUCCEEDED')
  })
})
