'use strict'

// This is to support the deferred calling of callbacks as set by the 'sendResponse' execution option.
class CallbackManager {
  constructor () {
    this.callbacks = {}
  }

  addCallback (eventName, executionName, callback) {
    this.callbacks[executionName] = {
      eventName: eventName,
      timestamp: new Date(),
      callback: callback
    }
  } // addCallback

  fireCallback (eventName, executionName, output) {
    if (!this.hasEvent(eventName, executionName)) {
      return
    }

    const callback = this.callbacks[executionName].callback
    delete this.callbacks[executionName]
    callback(null, output)
  } // fireCallback

  hasEvent (eventName, executionName) {
    return this.callbacks.hasOwnProperty(executionName) &&
      this.callbacks[executionName].eventName === eventName
  } // hasEvent
} // CallbackManager

module.exports = CallbackManager
