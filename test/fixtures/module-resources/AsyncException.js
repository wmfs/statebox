// AsyncException.js: throws AFTER an await (the case that hangs today)
module.exports = class AsyncException {
  async run (event, context) {
    await Promise.resolve()
    const obj = null
    return obj.oh_dear
  }
}
