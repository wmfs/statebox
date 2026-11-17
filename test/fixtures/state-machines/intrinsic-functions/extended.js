// State machines exercising the remaining States.* intrinsic functions.
// Each one is a single Pass state with Parameters of { "foo.$": <expression> }
const expressions = {
  ArrayPartition_partition: 'States.ArrayPartition($.inputArray, 4)',
  ArrayPartition_exact: 'States.ArrayPartition(States.Array(1, 2, 3, 4), 2)',
  ArrayPartition_badChunk: 'States.ArrayPartition($.inputArray, 0)',
  ArrayPartition_notArray: "States.ArrayPartition('nope', 2)",

  ArrayContains_found: 'States.ArrayContains($.inputArray, $.lookingFor)',
  ArrayContains_notFound: 'States.ArrayContains($.inputArray, 99)',
  ArrayContains_object: 'States.ArrayContains($.inputArray, $.lookingFor)',
  ArrayContains_notArray: 'States.ArrayContains(1, 1)',

  ArrayRange_range: 'States.ArrayRange(1, 9, 2)',
  ArrayRange_negative: 'States.ArrayRange(10, 1, -3)',
  ArrayRange_zeroStep: 'States.ArrayRange(1, 9, 0)',
  ArrayRange_tooBig: 'States.ArrayRange(1, 1001, 1)',
  ArrayRange_notInteger: 'States.ArrayRange(1.5, 9, 1)',

  ArrayGetItem_item: 'States.ArrayGetItem($.inputArray, $.index)',
  ArrayGetItem_outOfBounds: 'States.ArrayGetItem($.inputArray, 100)',
  ArrayGetItem_negative: 'States.ArrayGetItem($.inputArray, -1)',

  ArrayLength_length: 'States.ArrayLength($.inputArray)',
  ArrayLength_empty: 'States.ArrayLength(States.Array())',
  ArrayLength_notArray: "States.ArrayLength('abc')",

  ArrayUnique_unique: 'States.ArrayUnique($.inputArray)',
  ArrayUnique_notArray: 'States.ArrayUnique(null)',

  Base64Encode_encode: 'States.Base64Encode($.input)',
  Base64Encode_notString: 'States.Base64Encode(123)',
  Base64Decode_decode: 'States.Base64Decode($.base64)',
  Base64Decode_badBase64: "States.Base64Decode('not base64!')",

  Hash_sha1: "States.Hash($.Data, 'SHA-1')",
  Hash_algorithmPath: 'States.Hash($.Data, $.Algorithm)',
  Hash_badAlgorithm: "States.Hash($.Data, 'SHA-3')",

  JsonMerge_merge: 'States.JsonMerge($.json1, $.json2, false)',
  JsonMerge_deep: 'States.JsonMerge($.json1, $.json2, true)',
  JsonMerge_notObject: 'States.JsonMerge($.json1, States.Array(), false)',

  MathRandom_range: 'States.MathRandom($.start, $.end)',
  MathRandom_seeded: 'States.MathRandom(1, 1000, 42)',
  MathRandom_badRange: 'States.MathRandom(10, 1)',

  MathAdd_add: 'States.MathAdd($.value1, $.step)',
  MathAdd_notInteger: 'States.MathAdd(1.5, 1)',
  MathAdd_tooBig: 'States.MathAdd(2147483648, 1)',

  StringSplit_comma: 'States.StringSplit($.inputString, $.splitter)',
  StringSplit_multiple: "States.StringSplit($.inputString, '.+,=')",
  StringSplit_notString: "States.StringSplit(1, ',')",

  UUID_uuid: 'States.UUID()',
  UUID_withArgs: "States.UUID('x')",

  Unknown_function: 'States.NotARealFunction()',
  Unknown_prototype: 'States.toString()',

  Escapes_array: "States.Array('it\\'s \\{braced\\} \\\\')"
}

const machines = {}
for (const [name, expression] of Object.entries(expressions)) {
  machines[name] = {
    Comment: `Intrinsic function test: ${expression}`,
    StartAt: 'First',
    States: {
      First: {
        Type: 'Pass',
        Parameters: { 'foo.$': expression },
        End: true
      }
    }
  }
}

module.exports = machines
