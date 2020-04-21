module.exports = class FormFilling {
  run (event, context) {
    console.log('WAITING FOR SOMEONE TO FILL-IN A FORM!')
    context.sendTaskHeartbeat(
      {
        formId: 'fillThisFormInHuman!'
      }
    )
  }
}
