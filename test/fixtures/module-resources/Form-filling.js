'use strict'

module.exports = class FormFilling {
  init (resourceConfig, env, callback) {
    callback(null)
  }

  async run (event, context, done) {
    console.log('WAITING FOR SOMEONE TO FILL-IN A FORM!')
    const executionDescription = await context.sendTaskHeartbeat(
      {
        formId: 'fillThisFormInHuman!'
      }
    )

    done(executionDescription)
  }
}
