# statebox
[![Tymly Package](https://img.shields.io/badge/tymly-package-blue.svg)](https://tymly.io/)
[![npm (scoped)](https://img.shields.io/npm/v/@wmfs/statebox.svg)](https://www.npmjs.com/package/@wmfs/statebox)
[![Build Status](https://travis-ci.org/wmfs/statebox.svg?branch=master)](https://travis-ci.org/wmfs/statebox)
[![codecov](https://codecov.io/gh/wmfs/statebox/branch/master/graph/badge.svg)](https://codecov.io/gh/wmfs/statebox)
[![CodeFactor](https://www.codefactor.io/repository/github/wmfs/statebox/badge)](https://www.codefactor.io/repository/github/wmfs/statebox)
[![Dependabot badge](https://img.shields.io/badge/Dependabot-active-brightgreen.svg)](https://dependabot.com/)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/wmfs/tymly/blob/master/packages/pg-concat/LICENSE)


> Orchestrate Node functions using [Amazon States Language](https://states-language.net/spec.html)

## Useful links

* https://aws.amazon.com/step-functions/
* http://docs.aws.amazon.com/step-functions/latest/dg/concepts-amazon-states-language.html
* http://docs.aws.amazon.com/step-functions/latest/apireference/API_SendTaskSuccess.html


## <a name='install'></a>Install
```bash
$ npm install statebox --save
```

## <a name='usage'></a>Usage

```javascript
const Statebox = require('@wmfs/statebox')
const statebox = new Statebox({})

const main = async

function() {

  // STEP 1:
  // Create some 'module' resources (i.e. Javascript 
  // classes with 'run' and optional 'init' methods) 
  // that state machines can then refer to...
  // -------------------------------------------------
  await statebox.ready
  statebox.createModuleResources({
    // Simple module to add two numbers together
    add: class Add {
      run(event, context) {
        context.sendTaskSuccess(event.number1 + event.number2)
      }
    },
    // Simple module to subtract one number from another
    subtract: class Subtract {
      // Init methods are optional, but all allow  
      // resource-instances to be configured...
      init(resourceConfig, env, callback) {
        callback(null)
      }
      run(event, context) {
        context.sendTaskSuccess(event.number1 - event.number2)
      }
    }
  })

  // STEP 2:
  // Next create a new 'calculator' state
  // machine using Amazon States Language...
  // ---------------------------------------
  await statebox.createStateMachines({
      'calculator': {
        Comment: 'A simple calculator',
        StartAt: 'OperatorChoice',
        States: {
          OperatorChoice: {
            Type: 'Choice',
            Choices: [{
              Variable: '$.operator',
              StringEquals: '+',
              Next: 'Add'
            }, {
              Variable: '$.operator',
              StringEquals: '-',
              Next: 'Subtract'
            }]
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
    }, {}, // 'env': An environment/context/sandbox
  )

  // STEP 3:
  // Start a new execution on a state machine
  // ----------------------------------------
  const executionDescription = await statebox.startExecution({
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
  // Look at the results...
  // ----------------------
  const executionDescription2 = await statebox.waitUntilStoppedRunning(executionDescription.executionName)
  console.log(executionDescription2)
    //  Result object
    //  -------------
    // {
    //   executionName: '...',
    //   ctx: {
    //     numbers': {
    //       number1: 3,
    //       number2: 2
    //     },
    //     operator: '-',
    //     result: 1 <--- The important bit :-)
    //   },
    //   currentStateName:'Subtract',
    //   currentResource:'module:subtract',
    //   stateMachineName:'calculator',
    //   startDate: '2018-09-03T21:58:04.287Z'
    // }
}

if (require.main === module) {
  main();
}
```

## <a name='test'></a>Testing

```bash
$ npm test
```

## <a name='license'></a>License
[MIT](https://github.com/wmfs/tymly/packages/statebox/blob/master/LICENSE)
