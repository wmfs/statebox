/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect

const intrinsics = require('../lib/state-machines/instrinsics')

describe('States.Format', () => {
  const formatTests = [
    [['test'], 'test'],
    [['insert ->{}<- here', 'word'], 'insert ->word<- here'],
    [['insert ->{}<- here', true], 'insert ->true<- here'],
    [['insert ->{}<- here', 1], 'insert ->1<- here'],
    [['insert ->{}<- here', 1452.1212], 'insert ->1452.1212<- here'],
    [['insert ->{}<- here', null], 'insert ->null<- here']
  ]

  for (const [args, expected] of formatTests) {
    it(`format(${args.map(a => '"' + a + '"').join(', ')})`, () => {
      const result = intrinsics.format(...args)
      expect(result).to.equal(expected)
    })
  }
})
