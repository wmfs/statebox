module.exports = {
  StringToJson_object: require('./string-to-json/string-to-json.json'),
  StringToJson_string: require('./string-to-json/string-to-json.json'),
  StringToJson_number: require('./string-to-json/string-to-json.json'),
  StringToJson_boolean: require('./string-to-json/string-to-json.json'),
  StringToJson_noParams: require('./string-to-json/no-params.json'),
  StringToJson_tooManyParams: require('./string-to-json/too-many-params.json'),

  JsonToString_object: require('./json-to-string/object.json'),
  JsonToString_number: require('./json-to-string/number.json'),
  JsonToString_string: require('./json-to-string/string.json'),
  JsonToString_paramIsNotAPath: require('./json-to-string/param-is-not-a-path.json'),
  JsonToString_noParams: require('./json-to-string/no-params.json'),
  JsonToString_tooManyParams: require('./json-to-string/too-many-params.json'),

  Format_format: require('./format/format.json'),
  Format_everything: require('./format/everything.json'),
  Format_tooManyParams: require('./format/too-many-params.json'),
  Format_notEnoughParams: require('./format/not-enough-params.json'),
  Format_badParameter: require('./format/bad-parameter.json'),
  Format_noFormatString: require('./format/no-format-string.json'),
  Format_badFormatString: require('./format/bad-format-string.json'),

  Array_array: require('./array/array.json'),
  Array_emptyArray: require('./array/empty-array.json'),
  Array_numbers: require('./array/numbers.json'),
  Array_strings: require('./array/strings.json'),
  Array_nestedStatesArray: require('./array/nested-states-array.json'),

  UUID: require('./uuid.json')
}
