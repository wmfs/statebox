module.exports = class G {
  run (event, context) {
    context.sendTaskSuccess('G')
  }
}
