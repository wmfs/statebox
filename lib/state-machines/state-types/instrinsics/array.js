/*
 States.Array description from https://states-language.net/#appendix-b

  This Intrinsic Function takes zero or more arguments. The interpreter returns a JSON array
  containing the Values of the arguments, in the order provided.

  For example, given the following Payload Template:

  {
    "Parameters": {
      "foo.$": "States.Array('Foo', 2020, $.someJson, null)"
    }
  }

  Suppose the input to the Payload Template is as follows:

  {
    "someJson": {
      "random": "abcdefg"
    },
    "zebra": "stripe"
  }

  After processing the Payload Template, the new payload becomes:

  {
    "foo": [
      "Foo",
      2020,
      {
        "random": "abcdefg"
      },
      null
    ]
  }
*/

function statesArray (...args) {
  return args
}

module.exports = statesArray
