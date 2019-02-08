/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

const Resources = require('../lib/resources')

describe('Resource Resolver', () => {
  for (const p of [undefined, null, '']) {
    it(`Throw when no resource specified - '${p}'`, () => {
      expect(() => Resources.resolve(p)).to.throw('No \'Resource\' property set?')
    })
  }
  for (const p of ['fred', 'fred:', 'fred:  pants']) {
    it(`Throw with invalid resource name - ${p}`, () => {
      expect(() => Resources.resolve(p)).to.throw(`Unknown resource type 'fred' in '${p}'`)
    })
  }
  for (const p of [':fred', '     ']) {
    it(`Throw with invalid resource name - ${p}`, () => {
      expect(() => Resources.resolve(p)).to.throw(`Unknown resource type '' in '${p}'`)
    })
  }
})
