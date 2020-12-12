const { DateTime } = require('luxon')

class ExecutionContext {
  constructor (execDesc) {
    this.execDesc = execDesc
  }

  get DayOfWeek () { return DateTime.local().weekdayLong }
}

module.exports = executionDescription => new ExecutionContext(executionDescription)
