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

function jsonToString (arg) {
  return JSON.stringify(arg)
}

function validateParameters(parameterTokens) {
  if (parameterTokens.length !== 1) {
    throw Error(`States.JsonToString passed ${parameterTokens.length} arguments, wants a single argument`)
  }
  const type = parameterTokens[0].type
  if (type !== 'path') {
    throw Error(`States.JsonToString passed a ${type}, expects a path`)
  }
}

module.exports = jsonToString
jsonToString.validate = validateParameters
