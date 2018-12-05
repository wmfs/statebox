module.exports = class G {
  run (event, context) {
    console.log('G')
    context.sendTaskSuccess('G')
  }
}
