const schema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    somethingElse: { type: 'string' }
  },
  required: ['message']
}

module.exports = class Goodbye {
  init (resourceConfig, env) {
    this.schema = schema
  }

  run (event, context) {
    console.log('GOODBYE!')
    context.sendTaskSuccess()
  }
}
