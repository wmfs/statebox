/* eslint-env mocha */

// https://github.com/wmfs/statebox/issues/406
// ResultPath not getting set when calling context.sendTaskSuccess with a zero

const chai = require('chai')
const expect = chai.expect

const Statebox = require('./../lib')
const resultPathHandler = require('../lib/state-machines/state-types/path-handlers/result-path-handler')

const FALSY_RESULTS = [0, false, '', null]

class EchoResult {
  run (event, context) {
    context.sendTaskSuccess(event.value)
  }
}

class NoResult {
  run (event, context) {
    context.sendTaskSuccess()
  }
}

function taskMachine (resource) {
  return {
    StartAt: 'Task',
    States: {
      Task: { Type: 'Task', Resource: `module:${resource}`, ResultPath: '$.result', End: true }
    }
  }
}

function passMachine (result) {
  return {
    StartAt: 'Pass',
    States: {
      Pass: { Type: 'Pass', Result: result, ResultPath: '$.result', End: true }
    }
  }
}

describe('ResultPath with falsy results (#406)', function () {
  this.timeout(process.env.TIMEOUT || 5000)

  describe('result path handler', () => {
    for (const value of FALSY_RESULTS) {
      it(`sets $.result to ${JSON.stringify(value)}`, () => {
        const apply = resultPathHandler('$.result')
        expect(apply({ a: 1 }, value)).to.eql({ a: 1, result: value })
      })

      it(`sets nested $.deep.result to ${JSON.stringify(value)}`, () => {
        const apply = resultPathHandler('$.deep.result')
        expect(apply({ a: 1 }, value)).to.eql({ a: 1, deep: { result: value } })
      })
    }

    it('leaves the input alone when there is no result', () => {
      const apply = resultPathHandler('$.result')
      expect(apply({ a: 1 }, undefined)).to.eql({ a: 1 })
    })
  })

  describe('in state machines', () => {
    let statebox

    before('setup statebox', async () => {
      statebox = new Statebox()
      await statebox.ready
      statebox.createModuleResources({
        add: require('./fixtures/module-resources/Add'),
        subtract: require('./fixtures/module-resources/Subtract'),
        echoResult: EchoResult,
        noResult: NoResult
      })
      const machines = {
        subtractToZero: require('./fixtures/state-machines/calculator.json'),
        echoResult: taskMachine('echoResult'),
        noResult: taskMachine('noResult')
      }
      FALSY_RESULTS.forEach((value, i) => { machines[`passFalsy${i}`] = passMachine(value) })
      await statebox.createStateMachines(machines, {})
    })

    async function run (stateMachineName, input) {
      const { executionName } = await statebox.startExecution(input, stateMachineName, {})
      const execution = await statebox.waitUntilStoppedRunning(executionName)
      expect(execution.status).to.eql('SUCCEEDED')
      return execution.ctx
    }

    it('calculator: 3 - 3 sets result to 0', async () => {
      const ctx = await run('subtractToZero', { number1: 3, operator: '-', number2: 3 })
      expect(ctx).to.have.property('result', 0)
    })

    for (const value of FALSY_RESULTS) {
      it(`Task: sendTaskSuccess(${JSON.stringify(value)}) sets $.result`, async () => {
        const ctx = await run('echoResult', { value })
        expect(ctx).to.have.property('result', value)
      })
    }

    it('Task: sendTaskSuccess() with no output leaves the input alone', async () => {
      const ctx = await run('noResult', { a: 1 })
      expect(ctx).to.eql({ a: 1 })
    })

    FALSY_RESULTS.forEach((value, i) => {
      it(`Pass: Result ${JSON.stringify(value)} sets $.result`, async () => {
        const ctx = await run(`passFalsy${i}`, { a: 1 })
        expect(ctx).to.eql({ a: 1, result: value })
      })
    })
  })
})
