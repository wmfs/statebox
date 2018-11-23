
module.exports = function convertJsonpathToDottie (jsonpath) {
  let slice = 0
  if (jsonpath.length > 0 && jsonpath[0] === '$') {
    ++slice
  }
  if (jsonpath.length > slice && jsonpath[slice] === '.') {
    ++slice
  }

  const dottiePath = jsonpath.slice(slice)
  return dottiePath
}
