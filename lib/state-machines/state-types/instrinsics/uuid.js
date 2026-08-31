/*
  Description from https://states-language.net/#appendix-b

  Use the States.UUID intrinsic function to return a version 4 universally unique identifier (v4 UUID) generated using random numbers.
  For example, you can use this function to call other AWS services or resources that need a UUID parameter or insert items in a DynamoDB table.

  The States.UUID function is called with no arguments specified:

  "uuid.$": "States.UUID()"
  The function returns a randomly generated UUID, as in the following example:

  {"uuid": "ca4c1140-dcc1-40cd-ad05-7b4aa23df4a8" }
*/

const { v4: uuid } = require('uuid')

function statesUUID () {
  return uuid()
}

module.exports = statesUUID
