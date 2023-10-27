/*
 States.ArrayGetItem description from https://states-language.net/#appendix-b

  This intrinsic function returns a specified index's value. This function takes two arguments. The first argument is an array of values and the second argument is the array index of the value to return.

  For example, use the following inputArray and index values:

  { "inputArray": [1,2,3,4,5,6,7,8,9], "index": 5 }

  From these values, you can use the States.ArrayGetItem function to return the value in the index position 5 within the array:

  "item.$": "States.ArrayGetItem($.inputArray, $.index)"

  In this example, States.ArrayGetItem would return the following result:

  { "item": 6 }
*/

function arrayGetItem (arr, index) {
  return arr[index]
}

module.exports = arrayGetItem
