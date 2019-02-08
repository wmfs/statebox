/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

const ErrorStates = require('../lib/state-machines/state-types/errors')

describe('error states', () => {
  it('toString', () => {
    expect(ErrorStates.ALL.toString()).to.eql('States.ALL')
    expect(`${ErrorStates.ALL}`).to.eql('States.ALL')
  })

  it('error', () => {
    const e = ErrorStates.ALL.error('oops')
    expect(e).to.eql({
      error: 'States.ALL',
      cause: 'oops'
    })
  })

  it('raise', () => {
    expect(() => ErrorStates.ALL.raise('oh dear'))
      .to.throw()
      .and.eql({
        error: 'States.ALL',
        cause: 'oh dear'
      })
  })
})
