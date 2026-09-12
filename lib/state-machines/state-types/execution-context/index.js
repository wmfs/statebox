const { DateTime } = require('luxon')

class ExecutionContext {
  constructor (execDesc) {
    this.execDesc = execDesc
  }

  get StartTimestamp () { return this.execDesc.startDate }
  get DayOfWeek () { return DateTime.local().weekdayLong }
  get Time () { return DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE) }
  get Date () { return DateTime.local().toLocaleString(DateTime.DATE_SHORT) }
}

module.exports = executionDescription => new ExecutionContext(executionDescription)
