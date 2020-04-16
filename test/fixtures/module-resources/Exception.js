'use strict'

module.exports = class Exception {
  run (event, context) {
    const obj = { }
    try {
      obj.missingFn()
    } catch (err) {
      context.sendTaskFailure(err)
    }
  } // run
}
