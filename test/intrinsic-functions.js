/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect

const intrinsics = require('../lib/state-machines/instrinsics')

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
        const result = intrinsics.format(...args)
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
        const test = () => intrinsics.format(args)
        expect(test, `${asString} should throw`).to.throw()
      })
    }
  })
})
