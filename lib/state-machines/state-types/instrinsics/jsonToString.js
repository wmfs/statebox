/*
  States.JsonToString description from https://states-language.net/#appendix-b

  States.JsonToString

  This Intrinsic Function takes a single argument which MUST be a Path. The
  interpreter returns a string which is a JSON text representing the data identified
  by the Path.

  For example, given the following Payload Template:

  {
    "Parameters": {
      "foo.$": "States.JsonToString($.someJson)"
    }
  }

  Suppose the input to the Payload Template is as follows:

  {
    "someJson": {
      "name": "Foo",
      "year": 2020
    },
    "zebra": "stripe"
  }

  After processing the Payload Template, the new payload becomes:

  {
    "foo": "{\"name\":\"Foo\",\"year\":2020}"
  }
*/

function jsonToString (...args) {
  if (args.length !== 1) {
    throw Error(`States.StringToJson passed ${args.length} arguments, wants a single argument`)
  }
  const arg = args[0]

  return JSON.stringify(arg)
}

module.exports = jsonToString
