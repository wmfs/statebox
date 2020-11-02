/* eslint-env mocha */

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const _ = require('lodash')

const intrinsicFunctions = require('../lib/state-machines/state-types/instrinsics')
const intrinsicStateMachines = require('./fixtures/state-machines/intrinsic-function-state')

const Statebox = require('./../lib')

describe('Intrinsic Functions', function () {
  this.timeout(process.env.TIMEOUT || 5000)

  describe('Called from State Machine', () => {
    let statebox

    before('setup statebox', async () => {
      statebox = new Statebox()
      await statebox.ready
      await statebox.createStateMachines(intrinsicStateMachines, {})
    })

    const tests = [
      [
        'stringToJson',
        { someString: '{"hello":"world"}' },
        { hello: 'world' }
      ],
      [
        'jsonToString',
        { someJson: { name: 'Foo', year: 2020 }, zebra: 'stripe' },
        '{"name":"Foo","year":2020}'
      ],
      [
        'format',
        { name: 'Homer' },
        'Your name is Homer, we are in the year 2020'
      ],
      [
        'array',
        { someJson: { random: 'abcdefg' }, zebra: 'stripe' },
        ['Foo', 2020, { random: 'abcdefg' }, null]
      ]
    ]

    for (const [stateFunction, input, result] of tests) {
      test(
        stateFunction,
        input,
        result
      )
    }

    function test (stateFunction, input, result) {
      it(_.startCase(stateFunction), async () => {
        let executionDescription = await statebox.startExecution(
          Object.assign({}, input),
          stateFunction,
          {} // options
        )

        executionDescription = await statebox.waitUntilStoppedRunning(executionDescription.executionName)

        expect(executionDescription.status).to.eql('SUCCEEDED')
        expect(executionDescription.stateMachineName).to.eql(stateFunction)
        expect(executionDescription.currentResource).to.eql(undefined)
        expect(executionDescription.ctx.foo).to.eql(result)
      }) // it ...
    } // test
  }) // called from state machines

  describe('States.Format', () => {
    describe('good arguments', () => {
      const goodFormatTests = [
        [['test'], 'test'],
        [['insert ->{}<- here', 'word'], 'insert ->word<- here'],
        [['insert ->{}<- here', true], 'insert ->true<- here'],
        [['insert ->{}<- here', 1], 'insert ->1<- here'],
        [['insert ->{}<- here', 1452.1212], 'insert ->1452.1212<- here'],
        [['insert ->{}<- here', null], 'insert ->null<- here'],
        [['{}, {}, {}', 'word', 100, true], 'word, 100, true'],
        [['{}<-at start', 'here'], 'here<-at start'],
        [['at end->{}', 'here'], 'at end->here'],
        [['{}', null], 'null'],
        [['{}{}', null, null], 'nullnull']
      ]

      for (const [args, expected] of goodFormatTests) {
        it(`format(${args.map(a => '"' + a + '"').join(', ')})`, () => {
          const result = intrinsicFunctions.format(...args)
          expect(result).to.equal(expected)
        })
      }
    })

    describe('malformed arguments', () => {
      const badFormatTests = [
        ['test', 'extra', 'arguments'],
        ['test {}', 'yes', 'oh dear'],
        ['too few args {}'],
        ['still too few {} {} {}', 1, 2]
      ]

      for (const args of badFormatTests) {
        const asString = `format(${args.map(a => '"' + a + '"').join(', ')})`
        it(asString, () => {
          const test = () => intrinsicFunctions.format(args)
          expect(test, `${asString} should throw`).to.throw()
        })
      }
    })
  })

  describe('Function calls', () => {
    describe('is function call', () => {
      const goodCalls = [
        "States.Format('hello {}', 'world')",
        'States.StringToJson($path)',
        'States.JsonToString($path)',
        'States.Array()'
      ]

      const malformedCalls = [
        'States.Format()',
        'States.StringToJson()',
        'States.JsonToString(1,2,3,4,5)',
        'States.Array(undefined)'
      ]

      const notCalls = [
        "States.Trousers('tied up with string')",
        'Madeup.Function()',
        'true',
        '$.path',
        '99'
      ]

      describe('yes', () => {
        for (const call of goodCalls) {
          it(call, () => {
            expect(intrinsicFunctions.isFunctionCall(call)).to.be.true()
          })
        }
      })

      describe('yes, but malformed', () => {
        for (const call of malformedCalls) {
          it(call, () => {
            expect(intrinsicFunctions.isFunctionCall(call)).to.be.true()
          })
        }
      })

      describe('no', () => {
        for (const call of notCalls) {
          it(call, () => {
            expect(intrinsicFunctions.isFunctionCall(call)).to.be.false()
          })
        }
      })
    })
  })
})
