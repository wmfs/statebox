/*
  States.StringToJson description from https://states-language.net/#appendix-b

  States.StringToJson

  This Intrinsic Function takes a single argument whose Value MUST be a string. The
  interpreter applies a JSON parser to the Value and returns its parsed JSON form.

  For example, given the following Payload Template:

  {
    "Parameters": {
      "foo.$": "States.StringToJson($.someString)"
    }
  }

  Suppose the input to the Payload Template is as follows:

  {
    "someString": "{\"number\": 20}",
    "zebra": "stripe"
  }

  After processing the Payload Template, the new payload becomes:

  {
    "foo": {
      "number": 20
    }
  }
*/

function stringToJson (arg) {
  return JSON.parse(arg)
}

function validateParameters (parameterTokens, parameterValues) {
  if (parameterTokens.length !== 1) {
    throw Error(`States.StringToJson passed ${parameterTokens.length} arguments, wants a single argument`)
  }
  const arg = parameterValues[0]
  if (typeof arg !== 'string') {
    throw Error(`States.StringToJson passed an ${typeof arg}, wants a string argument`)
  }
}

module.exports = stringToJson
stringToJson.validate = validateParameters
