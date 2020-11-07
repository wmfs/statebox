/* eslint-env mocha */

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const _ = require('lodash')

const intrinsicFunctions = require('../lib/state-machines/state-types/instrinsics')
const intrinsicStateMachines = require('./fixtures/state-machines/intrinsic-functions')
const inputPathTokeniser = require('../lib/state-machines/state-types/path-handlers/input-path-tokeniser')

const Statebox = require('./../lib')

describe('Intrinsic Functions', function () {
  this.timeout(process.env.TIMEOUT || 5000)

  describe('Function parsing', () => {
    describe('function call', () => {
      const goodCalls = [
        "States.Format('hello {}', 'world')",
        'States.StringToJson($path)',
        'States.JsonToString($path)',
        'States.Array()',
        'States.Array(99)',
        'States.Array(true)',
        'States.Array(false)',
        "States.Array('fridge-freezer')",
        'States.Array(null)',
        'States.Array(States.Array(1, 2))',
        'States.Array(1, 2, States.Array(3, 4))',
        'States.Array(States.Array(1, 2), 3, 4)',
        'States.Array(1, 2, States.Array(3, 4), 5, 6)'
      ]

      for (const call of goodCalls) {
        it(call, () => {
          inputPathTokeniser(call)
        })
      }
    })

    describe('bad function calls', () => {
      const notCalls = [
        'Madeup.Function()',
        'true',
        '99',
        'States.Array(undefined)'
      ]

      for (const call of notCalls) {
        it(call, () => {
          expect(() => inputPathTokeniser(call)).to.throw()
        })
      }
    })

    describe('tokenise arguments', () => {
      const args = [
        ["'a string'", 'string:a string'],
        ['123', 'number:123'],
        ['123.45', 'number:123.45'],
        ['-123', 'number:-123'],
        ['-123.45', 'number:-123.45'],
        ['true', 'boolean:true'],
        ['false', 'boolean:false'],
        ['null', 'null:null'],
        ['$.path', 'path:$.path'],
        ['$.array[0:2]', 'path:$.array[0:2]']
      ]

      const context = {
        path: 'path value',
        array: ['one', 'two', 'three']
      }

      function parseArguments (args) {
        return inputPathTokeniser(`States.Array(${args})`).parameters.map(tok => `${tok.type}:${tok.value}`)
      }

      for (const [arg, result] of args) {
        it(arg, () => {
          expect(parseArguments(arg, context)).to.eql([result])
        })

        for (const [arg2, result2] of args) {
          const ts = [arg, arg2].join()
          it(ts, () => {
            expect(parseArguments(ts, context)).to.eql([result, result2])
          })
        }
      }

      const withWhitespace = [
        ['123, \'happy meal\'', ['number:123', 'string:happy meal']],
        ['123 ,\'happy meal\'', ['number:123', 'string:happy meal']],
        ['123 , \'happy meal\'', ['number:123', 'string:happy meal']],
        ['123,\'happy meal\' ', ['number:123', 'string:happy meal']],
        [' 123,\'happy meal\'', ['number:123', 'string:happy meal']],
        [' 123 , \'happy meal\' ', ['number:123', 'string:happy meal']],
        ['     123    ,    \'  happy meal  \'   ', ['number:123', 'string:  happy meal  ']]
      ]

      for (const [token, value] of withWhitespace) {
        it(token, () => {
          expect(parseArguments(token)).to.eql(value)
        })
      }
    })
  })

  describe('States.Format', () => {
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
      it(`States.Format(${args.map(a => '"' + a + '"').join(', ')})`, () => {
        const result = intrinsicFunctions.Format(...args)
        expect(result).to.equal(expected)
      })
    }
  })

  describe('States.Array', () => {
    const arrays = [
      [],
      [1, 2, 3],
      ['a', { an: 'object' }, false]
    ]

    for (const array of arrays) {
      it(`States.Array(${array.map(a => JSON.stringify(a)).join()})`, () => {
        const result = intrinsicFunctions.Array(...array)
        expect(result).to.eql(array)
      })
    }
  })

  describe('States.StringToJson', () => {
    const strings = [
      ['"hello"', 'hello'],
      ['99', 99],
      ['{"fruit": "basket"}', { fruit: 'basket' }],
      ['[1, 2, 3]', [1, 2, 3]]
    ]

    for (const [string, expected] of strings) {
      it(`States.StringToJson('${string}')`, () => {
        const json = intrinsicFunctions.StringToJson(string)
        expect(json).to.eql(expected)
      })
    }
  })

  describe('States.JsonToString', () => {
    const strings = [
      ['hello', '"hello"'],
      [99, '99'],
      [{ fruit: 'basket' }, '{"fruit":"basket"}'],
      [[1, 2, 3], '[1,2,3]']
    ]

    for (const [obj, expected] of strings) {
      it(`States.JsonToString('${obj}')`, () => {
        const string = intrinsicFunctions.JsonToString(obj)
        expect(string).to.eql(expected)
      })
    }
  })

  describe('In State Machines', () => {
    let statebox

    before('setup statebox', async () => {
      statebox = new Statebox()
      await statebox.ready
      await statebox.createStateMachines(intrinsicStateMachines, {})
    })

    const functionTests = {
      StringToJson: [
        ['object', { someString: '{"hello":"world"}' }, { hello: 'world' }],
        ['string', { someString: '"hello"' }, 'hello'],
        ['number', { someString: '2020' }, 2020],
        ['boolean', { someString: 'true' }, true],
        ['noParams', null, null, false],
        ['tooManyParams', null, null, false]
      ],
      JsonToString: [
        ['object', { someJson: { name: 'Foo', year: 2020 }, zebra: 'stripe' }, '{"name":"Foo","year":2020}'],
        ['number', { someJson: { name: 'Foo', year: 2020 }, zebra: 'stripe' }, '2020'],
        ['string', { someJson: { name: 'Foo', year: 2020 }, zebra: 'stripe' }, '"stripe"'],
        ['paramIsNotAPath', null, null, false],
        ['noParams', null, null, false],
        ['tooManyParams', null, null, false]
      ],
      Format: [
        ['format', { name: 'Homer' }, 'Your name is Homer, we are in the year 2020'],
        ['everything', null, 'string 100 true null'],
        ['tooManyParams', null, null, false],
        ['notEnoughParams', null, null, false],
        ['badParameter', { name: 'Homer' }, null, false],
        ['noFormatString', null, null, false],
        ['badFormatString', null, null, false]
      ],
      Array: [
        ['array', {
          someJson: { random: 'abcdefg' },
          zebra: 'stripe'
        }, ['Foo', 2020, { random: 'abcdefg' }, null]],
        ['emptyArray', null, []],
        ['numbers', null, [1, 2, 3, 4]],
        ['strings', null, ['one', 'two']],
        ['nestedStatesArray', null, ['one', 'two', ['three', 'four', 'five'], 'six']]
      ]
    }

    for (const [func, tests] of Object.entries(functionTests)) {
      describe(func, () => {
        for (const [testName, input, result, good = true] of tests) {
          const stateMachineName = `${func}_${testName}`
          it(_.startCase(testName), async () => {
            let executionDescription = await statebox.startExecution(
              Object.assign({}, input),
              stateMachineName,
              {} // options
            )

            executionDescription = await statebox.waitUntilStoppedRunning(executionDescription.executionName)

            if (good) {
              expect(executionDescription.status).to.eql('SUCCEEDED')
              expect(executionDescription.stateMachineName).to.eql(stateMachineName)
              expect(executionDescription.currentResource).to.eql(undefined)
              expect(executionDescription.ctx.foo).to.eql(result)
            } else {
              expect(executionDescription.status).to.eql('FAILED')
              expect(executionDescription.errorCode).to.eql('States.IntrinsicFailure')
            }
          }) // it ...
        }
      })
    }
  }) // called from state machines
})
