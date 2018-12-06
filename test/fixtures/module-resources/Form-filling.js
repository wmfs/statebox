module.exports = class FormFilling {
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
