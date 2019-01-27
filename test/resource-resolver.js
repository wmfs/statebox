/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

const Resources = require('../lib/resources')

describe('Resource Resolver', () => {
  it('Throw when no resource specified', () => {
    for (const p of [undefined, null, '']) {
      expect(() => Resources.resolve(p)).to.throw('No \'Resource\' property set?')
    }
  })
  it('Throw with invalid resource name', () => {
    for (const p of ['fred', 'fred:', ':fred', '     ', 'fred:  pants']) {
      expect(() => Resources.resolve(p)).to.throw(`Invalid resource identifier: ${p}`)
    }
  })
})
