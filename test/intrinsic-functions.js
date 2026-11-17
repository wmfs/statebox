/* eslint-env mocha */

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const _ = require('lodash')

const intrinsicFunctions = require('../lib/state-machines/state-types/instrinsics')
const intrinsicStateMachines = require('./fixtures/state-machines/intrinsic-functions')
const inputPathTokeniser = require('../lib/state-machines/state-types/path-handlers/input-path-tokeniser')

const Statebox = require('./../lib')

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

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
        ['$.array[0:2]', 'path:$.array[0:2]'],
        ["'\\''", "string:\\'"],
        ["'\\}'", 'string:\\}'],
        ["'\\{'", 'string:\\{'],
        ["'\\\\'", 'string:\\\\'],
        ["'embedded \\{\\'hello\\'\\}'", "string:embedded \\{\\'hello\\'\\}"]
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
      [['{}{}', null, null], 'nullnull'],
      [['{}', '\\{\\}'], '{}'],
      [["\\\\\\{\\'Socks\\'\\}\\\\"], "\\{'Socks'}\\"],
      [['{}', "\\\\\\{\\'Socks\\'\\}\\\\"], "\\{'Socks'}\\"],
      [['\\\\\\{{}\\}\\\\', "\\'Socks\\'"], "\\{'Socks'}\\"]
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

  describe('States.ArrayPartition', () => {
    const tests = [
      [[[1, 2, 3, 4, 5, 6, 7, 8, 9], 4], [[1, 2, 3, 4], [5, 6, 7, 8], [9]]],
      [[[1, 2, 3, 4], 2], [[1, 2], [3, 4]]],
      [[[1, 2], 5], [[1, 2]]],
      [[[], 3], []]
    ]
    for (const [args, expected] of tests) {
      it(`States.ArrayPartition(${JSON.stringify(args)})`, () => {
        expect(intrinsicFunctions.ArrayPartition(...args)).to.eql(expected)
      })
    }
  })

  describe('States.ArrayContains', () => {
    const tests = [
      [[[1, 2, 3], 2], true],
      [[[1, 2, 3], 4], false],
      [[[1, '2', 3], 2], false],
      [[[{ a: 1 }, { b: [1, 2] }], { b: [1, 2] }], true],
      [[[null], null], true],
      [[[], 1], false]
    ]
    for (const [args, expected] of tests) {
      it(`States.ArrayContains(${JSON.stringify(args)})`, () => {
        expect(intrinsicFunctions.ArrayContains(...args)).to.equal(expected)
      })
    }
  })

  describe('States.ArrayRange', () => {
    const tests = [
      [[1, 9, 2], [1, 3, 5, 7, 9]],
      [[1, 10, 2], [1, 3, 5, 7, 9]],
      [[0, 0, 1], [0]],
      [[10, 1, -3], [10, 7, 4, 1]],
      [[1, 0, 1], []]
    ]
    for (const [args, expected] of tests) {
      it(`States.ArrayRange(${args.join(', ')})`, () => {
        expect(intrinsicFunctions.ArrayRange(...args)).to.eql(expected)
      })
    }
  })

  describe('States.ArrayGetItem / ArrayLength / ArrayUnique', () => {
    it('States.ArrayGetItem([1..9], 5)', () => {
      expect(intrinsicFunctions.ArrayGetItem([1, 2, 3, 4, 5, 6, 7, 8, 9], 5)).to.equal(6)
    })
    it('States.ArrayLength([1..9])', () => {
      expect(intrinsicFunctions.ArrayLength([1, 2, 3, 4, 5, 6, 7, 8, 9])).to.equal(9)
    })
    it('States.ArrayUnique([1,2,3,3,3,3,3,3,4])', () => {
      expect(intrinsicFunctions.ArrayUnique([1, 2, 3, 3, 3, 3, 3, 3, 4])).to.eql([1, 2, 3, 4])
    })
    it('States.ArrayUnique uses deep equality', () => {
      expect(intrinsicFunctions.ArrayUnique([{ a: 1 }, { a: 1 }, '1', 1])).to.eql([{ a: 1 }, '1', 1])
    })
  })

  describe('States.Base64Encode / Base64Decode', () => {
    const tests = [
      ['Data to encode', 'RGF0YSB0byBlbmNvZGU='],
      ['', ''],
      ['Ünïcødé ✓', 'w5xuw69jw7hkw6kg4pyT']
    ]
    for (const [plain, encoded] of tests) {
      it(`'${plain}' <-> '${encoded}'`, () => {
        expect(intrinsicFunctions.Base64Encode(plain)).to.equal(encoded)
        expect(intrinsicFunctions.Base64Decode(encoded)).to.equal(plain)
      })
    }
  })

  describe('States.Hash', () => {
    const tests = [
      ['MD5', '812f45842bc6d66ee14572ce20db8e86'],
      ['SHA-1', 'aaff4a450a104cd177d28d18d74485e8cae074b7'],
      ['SHA-256', null],
      ['SHA-384', null],
      ['SHA-512', null]
    ]
    const crypto = require('crypto')
    const nodeName = { MD5: 'md5', 'SHA-1': 'sha1', 'SHA-256': 'sha256', 'SHA-384': 'sha384', 'SHA-512': 'sha512' }
    for (const [algorithm, known] of tests) {
      it(`States.Hash('input data', '${algorithm}')`, () => {
        const expected = crypto.createHash(nodeName[algorithm]).update('input data').digest('hex')
        const result = intrinsicFunctions.Hash('input data', algorithm)
        expect(result).to.equal(expected)
        if (known) expect(result).to.equal(known)
      })
    }
  })

  describe('States.JsonMerge', () => {
    it('shallow merges, second object wins', () => {
      const json1 = { a: { a1: 1, a2: 2 }, b: 2 }
      const json2 = { a: { a3: 1, a4: 2 }, c: 3 }
      expect(intrinsicFunctions.JsonMerge(json1, json2, false)).to.eql({ a: { a3: 1, a4: 2 }, b: 2, c: 3 })
      expect(json1).to.eql({ a: { a1: 1, a2: 2 }, b: 2 }) // inputs untouched
    })
  })

  describe('States.MathRandom', () => {
    it('stays within [start, end)', () => {
      for (let i = 0; i !== 500; ++i) {
        const r = intrinsicFunctions.MathRandom(1, 4)
        expect(Number.isInteger(r)).to.equal(true)
        expect(r).to.be.within(1, 3)
      }
    })
    it('seeded calls are repeatable', () => {
      const r = intrinsicFunctions.MathRandom(1, 1000, 1234)
      for (let i = 0; i !== 10; ++i) {
        expect(intrinsicFunctions.MathRandom(1, 1000, 1234)).to.equal(r)
      }
    })
  })

  describe('States.MathAdd', () => {
    const tests = [[[111, -1], 110], [[0, 0], 0], [[-5, -5], -10]]
    for (const [args, expected] of tests) {
      it(`States.MathAdd(${args.join(', ')})`, () => {
        expect(intrinsicFunctions.MathAdd(...args)).to.equal(expected)
      })
    }
  })

  describe('States.StringSplit', () => {
    const tests = [
      [['1,2,3,4,5', ','], ['1', '2', '3', '4', '5']],
      [['This.is+a,test=string', '.+,='], ['This', 'is', 'a', 'test', 'string']],
      [['a,,b', ','], ['a', 'b']],
      [['a]b-c^d\\e', ']-^\\'], ['a', 'b', 'c', 'd', 'e']],
      [['no delimiters', ','], ['no delimiters']],
      [['', ','], []]
    ]
    for (const [args, expected] of tests) {
      it(`States.StringSplit(${JSON.stringify(args)})`, () => {
        expect(intrinsicFunctions.StringSplit(...args)).to.eql(expected)
      })
    }
  })

  describe('States.UUID', () => {
    it('returns distinct v4 UUIDs', () => {
      const a = intrinsicFunctions.UUID()
      const b = intrinsicFunctions.UUID()
      expect(a).to.match(UUID_V4)
      expect(b).to.match(UUID_V4)
      expect(a).to.not.equal(b)
    })
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
      ],
      ArrayPartition: [
        ['partition', { inputArray: [1, 2, 3, 4, 5, 6, 7, 8, 9] }, [[1, 2, 3, 4], [5, 6, 7, 8], [9]]],
        ['exact', null, [[1, 2], [3, 4]]],
        ['badChunk', { inputArray: [1, 2, 3] }, null, false],
        ['notArray', null, null, false]
      ],
      ArrayContains: [
        ['found', { inputArray: [1, 2, 3, 4, 5, 6, 7, 8, 9], lookingFor: 5 }, true],
        ['notFound', { inputArray: [1, 2, 3, 4, 5, 6, 7, 8, 9] }, false],
        ['object', { inputArray: [{ id: 1 }, { id: 2 }], lookingFor: { id: 2 } }, true],
        ['notArray', null, null, false]
      ],
      ArrayRange: [
        ['range', null, [1, 3, 5, 7, 9]],
        ['negative', null, [10, 7, 4, 1]],
        ['zeroStep', null, null, false],
        ['tooBig', null, null, false],
        ['notInteger', null, null, false]
      ],
      ArrayGetItem: [
        ['item', { inputArray: [1, 2, 3, 4, 5, 6, 7, 8, 9], index: 5 }, 6],
        ['outOfBounds', { inputArray: [1, 2, 3] }, null, false],
        ['negative', { inputArray: [1, 2, 3] }, null, false]
      ],
      ArrayLength: [
        ['length', { inputArray: [1, 2, 3, 4, 5, 6, 7, 8, 9] }, 9],
        ['empty', null, 0],
        ['notArray', null, null, false]
      ],
      ArrayUnique: [
        ['unique', { inputArray: [1, 2, 3, 3, 3, 3, 3, 3, 4] }, [1, 2, 3, 4]],
        ['notArray', null, null, false]
      ],
      Base64Encode: [
        ['encode', { input: 'Data to encode' }, 'RGF0YSB0byBlbmNvZGU='],
        ['notString', null, null, false]
      ],
      Base64Decode: [
        ['decode', { base64: 'RGF0YSB0byBlbmNvZGU=' }, 'Data to encode'],
        ['badBase64', null, null, false]
      ],
      Hash: [
        ['sha1', { Data: 'input data' }, 'aaff4a450a104cd177d28d18d74485e8cae074b7'],
        ['algorithmPath', { Data: 'input data', Algorithm: 'MD5' }, '812f45842bc6d66ee14572ce20db8e86'],
        ['badAlgorithm', { Data: 'input data' }, null, false]
      ],
      JsonMerge: [
        ['merge', { json1: { a: { a1: 1, a2: 2 }, b: 2 }, json2: { a: { a3: 1, a4: 2 }, c: 3 } }, { a: { a3: 1, a4: 2 }, b: 2, c: 3 }],
        ['deep', { json1: { a: 1 }, json2: { b: 2 } }, null, false],
        ['notObject', { json1: { a: 1 } }, null, false]
      ],
      MathRandom: [
        ['range', { start: 1, end: 999 }, r => expect(r).to.be.within(1, 998)],
        ['seeded', null, intrinsicFunctions.MathRandom(1, 1000, 42)],
        ['badRange', null, null, false]
      ],
      MathAdd: [
        ['add', { value1: 111, step: -1 }, 110],
        ['notInteger', null, null, false],
        ['tooBig', null, null, false]
      ],
      StringSplit: [
        ['comma', { inputString: '1,2,3,4,5', splitter: ',' }, ['1', '2', '3', '4', '5']],
        ['multiple', { inputString: 'This.is+a,test=string' }, ['This', 'is', 'a', 'test', 'string']],
        ['notString', null, null, false]
      ],
      UUID: [
        ['uuid', null, r => expect(r).to.match(UUID_V4)],
        ['withArgs', null, null, false]
      ],
      Unknown: [
        ['function', null, null, false],
        ['prototype', null, null, false]
      ],
      Escapes: [
        ['array', null, ["it's {braced} \\"]]
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
              if (typeof result === 'function') {
                result(executionDescription.ctx.foo)
              } else {
                expect(executionDescription.ctx.foo).to.eql(result)
              }
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
