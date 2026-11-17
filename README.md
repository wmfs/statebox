
![Statebox Logo](/images/statebox-logo.png)

[![Tymly Package](https://img.shields.io/badge/tymly-package-blue.svg)](https://tymly.io/)
[![npm (scoped)](https://img.shields.io/npm/v/@wmfs/statebox.svg)](https://www.npmjs.com/package/@wmfs/statebox)
[![CircleCI](https://circleci.com/gh/wmfs/statebox.svg?style=svg)](https://circleci.com/gh/wmfs/statebox)
[![codecov](https://codecov.io/gh/wmfs/statebox/branch/master/graph/badge.svg)](https://codecov.io/gh/wmfs/statebox)
[![CodeFactor](https://www.codefactor.io/repository/github/wmfs/statebox/badge)](https://www.codefactor.io/repository/github/wmfs/statebox)
[![Dependabot badge](https://img.shields.io/badge/Dependabot-active-brightgreen.svg)](https://dependabot.com/)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/wmfs/tymly/blob/master/packages/pg-concat/LICENSE)


> Orchestrate Node functions using [Amazon States Language](https://states-language.net/spec.html)

## Contents

* [Install](#install)
* [Usage](#usage)
* [Supported States Language features](#features)
* [Not yet supported](#not-supported) and [known issues](#known-issues)
* [Resources](#resources)
* [API](#api)
* [Testing](#test)

## Useful links

* [AWS Step Functions](https://aws.amazon.com/step-functions/) - overview of Amazon States Language, use cases, etc
* [statelint](https://npmjs.com/package/@wmfs/statelint) - a validator for Amazon States Language JSON files
* https://docs.aws.amazon.com/step-functions/latest/dg/concepts-amazon-states-language.html
* https://docs.aws.amazon.com/step-functions/latest/apireference/API_SendTaskSuccess.html

## <a name='install'></a>Install
```bash
$ npm install @wmfs/statebox --save
```

## <a name='usage'></a>Usage

```javascript
const Statebox = require('@wmfs/statebox')
const statebox = new Statebox({})

async function main () {
  await statebox.ready

  // STEP 1:
  // Create some 'module' resources (i.e. Javascript
  // classes with 'run' and optional 'init' methods)
  // that state machines can then refer to...
  // -------------------------------------------------
  statebox.createModuleResources({
    // Simple module to add two numbers together
    add: class Add {
      run (event, context) {
        context.sendTaskSuccess(event.number1 + event.number2)
      }
    },
    // Simple module to subtract one number from another
    subtract: class Subtract {
      // Init methods are optional, but allow
      // resource-instances to be configured.
      // They can be async, and are awaited...
      async init (resourceConfig, env) {
      }

      run (event, context) {
        context.sendTaskSuccess(event.number1 - event.number2)
      }
    }
  })

  // STEP 2:
  // Next create a new 'calculator' state
  // machine using Amazon States Language...
  // ---------------------------------------
  await statebox.createStateMachines(
    {
      calculator: {
        Comment: 'A simple calculator',
        StartAt: 'OperatorChoice',
        States: {
          OperatorChoice: {
            Type: 'Choice',
            Choices: [
              {
                Variable: '$.operator',
                StringEquals: '+',
                Next: 'Add'
              },
              {
                Variable: '$.operator',
                StringEquals: '-',
                Next: 'Subtract'
              }
            ]
          },
          Add: {
            Type: 'Task',
            InputPath: '$.numbers',
            Resource: 'module:add', // See createModuleResources()
            ResultPath: '$.result',
            End: true
          },
          Subtract: {
            Type: 'Task',
            InputPath: '$.numbers',
            Resource: 'module:subtract',
            ResultPath: '$.result',
            End: true
          }
        }
      }
    },
    {} // 'env': An environment/context/sandbox
  )

  // STEP 3:
  // Start a new execution on a state machine
  // ----------------------------------------
  const execution = await statebox.startExecution(
    {
      numbers: {
        number1: 3,
        number2: 2
      },
      operator: '-'
    }, // input
    'calculator', // state machine name
    {} // options
  )

  // STEP 4:
  // Executions run asynchronously, so wait
  // for this one to finish...
  // --------------------------------------
  const executionDescription = await statebox.waitUntilStoppedRunning(execution.executionName)

  // STEP 5:
  // Look at the results...
  // ----------------------
  console.log(executionDescription)
  //  Result object
  //  -------------
  // {
  //   executionName: '...',
  //   status: 'SUCCEEDED',
  //   ctx: {
  //     numbers: {
  //       number1: 3,
  //       number2: 2
  //     },
  //     operator: '-',
  //     result: 1 <--- The important bit :-)
  //   },
  //   currentStateName: 'Subtract',
  //   currentResource: 'module:subtract',
  //   stateMachineName: 'calculator',
  //   startDate: '2018-09-03T21:58:04.287Z',
  //   ...
  // }
}

if (require.main === module) {
  main()
}
```

## <a name='features'></a>Supported States Language features

Statebox runs state machines written in the [Amazon States Language](https://states-language.net/spec.html) (ASL), using JSONPath. This section lists what's supported. See [Not yet supported](#not-supported) for the gaps.

### State types

| Type | Supported fields | Notes |
|---|---|---|
| `Task` | `Resource`, `ResourceConfig`, `Catch` | `Resource` is `<type>:<name>`, e.g. `module:add`. See [Resources](#resources). `ResourceConfig` is a statebox extension that's passed to the resource's `init`. |
| `Pass` | `Result` | With no `Result`, the state's input is passed through. |
| `Choice` | `Choices`, `Default` | Rules are evaluated by [`@wmfs/asl-choice-processor`](https://github.com/wmfs/asl-choice-processor#readme), which documents every operator. If nothing matches and there's no `Default`, the execution fails with `States.NoChoiceMatched`. |
| `Wait` | `Seconds`, `SecondsPath`, `Timestamp`, `TimestampPath` | |
| `Succeed` | | |
| `Fail` | `Error`, `Cause` | |
| `Parallel` | `Branches`, `Catch` | The output is an array with one entry per branch. If any branch fails, the state fails with `States.BranchFailed`. Every branch's `StartAt` must be unique in the state machine; see [Known issues](#known-issues). |
| `Map` | `ItemsPath`, `Iterator`, `Catch` | Each item is the input to one run of the `Iterator`. The output is an array of the results. If any item fails, the state fails with `States.BranchFailed`. |

Every state also supports `Type`, `Comment`, `Next`, `End`, and the input and output fields below (except where the spec says a state type doesn't have them).

### Input and output processing

Fields are applied in this order:

1. **`InputPath`** selects part of the state's input. `null` gives `{}`.
2. **`Parameters`** builds a new input from a template. Keys ending in `.$` take a Path or an [intrinsic function](#intrinsic-functions).
3. The state runs. For a `Task`, this means calling its resource.
4. **`ResultSelector`** builds a new result from a template, in the same way as `Parameters`.
5. **`ResultPath`** says where the result goes in the state's input, e.g. `"$.result"`. `null` throws the result away and keeps the input.
6. **`OutputPath`** selects part of that to pass to the next state.

```json
{
  "Type": "Pass",
  "Parameters": {
    "greeting.$": "States.Format('Hello {}', $.name)",
    "count.$": "States.ArrayLength($.items)"
  },
  "ResultPath": "$.summary",
  "End": true
}
```

With input `{ "name": "Ada", "items": [1, 2, 3] }`, the output is `{ "name": "Ada", "items": [1, 2, 3], "summary": { "greeting": "Hello Ada", "count": 3 } }`.

**Where statebox differs from the spec:**

- **No `ResultPath`:** if the result is an object, statebox merges it into the input, with result values winning, instead of replacing the input. Kept for compatibility with existing state machines.
- **Paths that match nothing:** in `Parameters` and `ResultSelector` these give `null` rather than failing with `States.ParameterPathFailure`.
- **Falsy results:** `0`, `false`, `''` and `null` are written to `ResultPath` like any other result. A task that calls `sendTaskSuccess()` with no output leaves its input unchanged.

### <a name='intrinsic-functions'></a>Intrinsic functions

All of the spec's intrinsic functions can be used in `Parameters` and `ResultSelector`, and they can be nested. If one fails, the state fails with `States.IntrinsicFailure`.

| Function | Example | Result |
|---|---|---|
| `States.Format` | `States.Format('Hi {}, you are {}', $.name, 42)` | `"Hi Ada, you are 42"` |
| `States.StringToJson` | `States.StringToJson('{"a":1}')` | `{ "a": 1 }` |
| `States.JsonToString` | `States.JsonToString($.obj)` | `"{\"a\":1}"` |
| `States.Array` | `States.Array(1, 'two', $.three)` | `[1, "two", 3]` |
| `States.ArrayPartition` | `States.ArrayPartition($.nums, 2)` | `[[1, 2], [3, 4], [5]]` |
| `States.ArrayContains` | `States.ArrayContains($.nums, 3)` | `true` |
| `States.ArrayRange` | `States.ArrayRange(1, 9, 2)` | `[1, 3, 5, 7, 9]` |
| `States.ArrayGetItem` | `States.ArrayGetItem($.nums, 1)` | `2` |
| `States.ArrayLength` | `States.ArrayLength($.nums)` | `5` |
| `States.ArrayUnique` | `States.ArrayUnique(States.Array(1, 1, 2))` | `[1, 2]` |
| `States.Base64Encode` | `States.Base64Encode('Data to encode')` | `"RGF0YSB0byBlbmNvZGU="` |
| `States.Base64Decode` | `States.Base64Decode('RGF0YSB0byBlbmNvZGU=')` | `"Data to encode"` |
| `States.Hash` | `States.Hash('input data', 'SHA-1')` | `"aaff4a450a104cd177d28d18d74485e8cae074b7"` |
| `States.JsonMerge` | `States.JsonMerge($.a, $.b, false)` | shallow merge; the second object wins |
| `States.MathRandom` | `States.MathRandom(1, 10)` | an integer from 1 up to 9 (optional third argument: seed) |
| `States.MathAdd` | `States.MathAdd($.count, -1)` | `$.count - 1` |
| `States.StringSplit` | `States.StringSplit('a,b;c', ',;')` | `["a", "b", "c"]` |
| `States.UUID` | `States.UUID()` | a version 4 UUID |

Arguments are single-quoted strings, numbers, `true`, `false`, `null`, Paths or other intrinsic functions. Inside strings, write `\'`, `\{`, `\}` and `\\` for `'`, `{`, `}` and `\`. In JSON each backslash is doubled, e.g. `"States.Format('It\\'s {}', $.x)"`.

Some functions check their arguments and fail with `States.IntrinsicFailure` otherwise:

- `ArrayRange` can create at most 1000 items.
- `Base64Encode`, `Base64Decode` and `Hash` take strings of up to 10,000 characters.
- `Hash` supports `MD5`, `SHA-1`, `SHA-256`, `SHA-384` and `SHA-512`.
- `JsonMerge` only supports a shallow merge, so its third argument must be `false`.
- `MathAdd` and `MathRandom` take integers.

### Errors and `Catch`

`Task`, `Parallel` and `Map` states can have a `Catch` list. The first entry whose `ErrorEquals` contains the error's name, or `States.ALL`, decides the next state. The state's input is passed on unchanged.

Errors raised by statebox:

| Error | When |
|---|---|
| `States.TaskFailed` | A task resource threw an error, or returned a rejected promise |
| `States.BranchFailed` | A `Parallel` branch or `Map` item failed |
| `States.NoChoiceMatched` | No Choice rule matched and there's no `Default` |
| `States.IntrinsicFailure` | An intrinsic function failed, e.g. it was given the wrong type of argument |

Resources can fail with their own errors: `context.sendTaskFailure({ error: 'MyError', cause: '...' })`.

## <a name='not-supported'></a>Not yet supported

- **`Retry`** on `Task`, `Parallel` and `Map`.
- **Task timeouts:** `TimeoutSeconds`, `TimeoutSecondsPath`, `HeartbeatSeconds` and `HeartbeatSecondsPath`.
- **`ResultPath` on `Catch`:** the error isn't added to the state's input.
- **Newer `Map` fields:** `ItemProcessor` (use `Iterator`), `ItemSelector`, `MaxConcurrency`, `ItemReader`, `ItemBatcher`, `ResultWriter` and `ToleratedFailure*`.
- **The Context Object:** `$$.` Paths, e.g. `$$.Execution.Name`.
- **`Fail` paths:** `ErrorPath` and `CausePath`.
- **JSONata:** `QueryLanguage: "JSONata"`, `Arguments`, `Output`, `Assign` and variables.

### <a name='known-issues'></a>Known issues

- **Repeated `StartAt` names:** each `Parallel` branch and `Map` `Iterator` runs as a separate state machine named `<stateMachine>:<StartAt>`. If two of them in the same state machine have the same `StartAt`, the later one replaces the earlier, and both run the same steps. Give every branch and iterator a unique `StartAt`.
- **`"Seconds": 0`:** a `Wait` state with `"Seconds": 0` fails the execution. Use `"Seconds": 1`, or leave out the `Wait`.
- **`ResourceConfig` checks:** the `schema` check only runs for module resources that have an `init` method.

## <a name='resources'></a>Resources

A `Task`'s `Resource` is `<type>:<name>`. Statebox supports `module` resources itself, and others can be added with [`registerResourceResolver`](#resource-resolvers).

### Module resources

A module resource is a class with a `run` method and an optional `init` method:

```javascript
statebox.createModuleResources({
  greet: class Greet {
    // Optional. Called once, when the state machine is created.
    // resourceConfig is the state's ResourceConfig; env is the
    // second argument to createStateMachines(). Can be async.
    async init (resourceConfig, env) {
      this.greeting = resourceConfig.greeting
    }

    // Called each time the state runs. Call one of the context methods
    // when finished. Throwing an error, or returning a rejected promise,
    // fails the state with States.TaskFailed.
    run (event, context) {
      context.sendTaskSuccess({ message: `${this.greeting}, ${event.name}` })
    }
  }
})
```

```json
{
  "Type": "Task",
  "Resource": "module:greet",
  "ResourceConfig": { "greeting": "Hello" },
  "ResultPath": "$.result",
  "End": true
}
```

A class can declare which `ResourceConfig` properties it needs with a JSON-schema style `schema` property, e.g. `schema = { required: ['greeting'], properties: { greeting: { type: 'string' } } }`. Statebox then checks them when the state machine is created, but only if the class also has an `init` method. See [Known issues](#known-issues).

#### The task `context`

| Method / property | |
|---|---|
| `sendTaskSuccess(output)` | Finish the state. `output` becomes the state's result. |
| `sendTaskFailure({ error, cause })` | Fail the state with this error, which `Catch` can handle |
| `sendTaskHeartbeat(output)` | Merge `output` into the execution's data and stay in this state, e.g. while waiting for a person to fill in a form. Returns a promise. |
| `resolveInputPaths(input, template)` | Returns a copy of `template` with every string starting `$` replaced by that Path's value in `input` |
| `executionName`, `executionOptions`, `userId`, `stateMachineMeta` | Details of the running execution |

Only the first `sendTaskSuccess` or `sendTaskFailure` call counts. Later calls are ignored with a warning.

### <a name='resource-resolvers'></a>Other resource types

`registerResourceResolver(type, resolver)` adds a resource type. Statebox calls `resolver(name, resourceConfig, stateMachineName)` once for each Task that uses the type. The resolver returns an object with `init(env)` and `run(input, context)`:

```javascript
statebox.registerResourceResolver('fn', (name, resourceConfig, stateMachineName) => ({
  init (env) {},
  run (input, context) {
    context.sendTaskSuccess(input.number * 2)
  }
}))
// "Resource": "fn:double"
```

## <a name='api'></a>API

### `new Statebox(options)`

| Option | |
|---|---|
| `dao` | Where executions are stored. The default is in memory. |
| `bootedServices` | Used by Tymly. If it includes a `storage` service, executions are stored there. |
| `messages` | Optional logger with `info` and `warning` methods |

Wait for `statebox.ready` before using it.

### Methods

| Method | |
|---|---|
| `createModuleResources({ name: Class, ... })` / `createModuleResource(name, Class)` | Add module resources |
| `listModuleResources()`, `findModuleByName(name)` | |
| `registerResourceResolver(type, resolver)` | Add a resource type. See [Other resource types](#resource-resolvers). |
| `createStateMachines({ name: definition, ... }, env)` | Create state machines. `env` is passed to every resource's `init`. Returns a promise. |
| `createStateMachine(name, definition, meta, env)` | Create one state machine, with optional metadata |
| `listStateMachines()`, `findStateMachineByName(name)`, `findStateMachines(options)`, `findStates(options)` | |
| `startExecution(input, stateMachineName, options)` | Start an execution. Returns its execution description; see `sendResponse` below. |
| `waitUntilStoppedRunning(executionName)` | Resolves with the execution description once the execution has succeeded, failed or been stopped |
| `describeExecution(executionName)` | The execution description |
| `stopExecution(cause, errorCode, executionName, options)` | Stop a running execution. Its status becomes `STOPPED`. |
| `sendTaskSuccess(executionName, output)`, `sendTaskFailure(executionName, { error, cause })` | Finish the current task from outside, e.g. after a person submits a form |
| `sendTaskHeartbeat(executionName, output)`, `sendTaskLastHeartbeat(executionName, output)` | Update the current task's data. The "last" version also moves on to the next state. |

### Execution descriptions

`startExecution`, `waitUntilStoppedRunning` and `describeExecution` return:

| Property | |
|---|---|
| `executionName` | Unique ID of the execution |
| `stateMachineName` | |
| `status` | `RUNNING`, `SUCCEEDED`, `FAILED` or `STOPPED` |
| `ctx` | The execution's data. When it's finished, this is the output. |
| `currentStateName`, `currentResource` | Where the execution is, or where it finished |
| `errorCode`, `errorMessage` | Set when the execution failed |
| `startDate`, `executionOptions` | |

### `sendResponse`

`startExecution`'s `options.sendResponse` controls when the returned promise resolves:

| Value | Resolves |
|---|---|
| `IMMEDIATELY` (default) | Straight away, while the execution is still running |
| `COMPLETE` | When the execution finishes |
| `ENTERING:<StateName>` | When the execution enters that state |
| `AFTER_RESOURCE_CALLBACK.TYPE:<moduleName>` | When that module resource calls `sendTaskHeartbeat`, e.g. a form is ready to show |

## <a name='test'></a>Testing

```bash
$ npm test
```

## <a name='license'></a>License
[MIT](https://github.com/wmfs/statebox/blob/master/LICENSE)
