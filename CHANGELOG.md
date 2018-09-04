## [1.4.1](https://github.com/wmfs/statebox/compare/v1.4.0...v1.4.1) (2018-09-04)


### 🐛 Bug Fixes

* Beef up is object check to avoid trying work with a null ([fd60fa1](https://github.com/wmfs/statebox/commit/fd60fa1))

# [1.4.0](https://github.com/wmfs/statebox/compare/v1.3.2...v1.4.0) (2018-09-03)


### ✨ Features

* CreateStateMachines returns a promise, rather than taking a callback ([af6a8e3](https://github.com/wmfs/statebox/commit/af6a8e3))


### 🐛 Bug Fixes

* Reinstated stateMachineMeta ([c43c10a](https://github.com/wmfs/statebox/commit/c43c10a))


### 🛠 Builds

* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/git requirement from 7.0.1 to 7.0.2 ([85e551b](https://github.com/wmfs/statebox/commit/85e551b))
* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/git requirement from 7.0.2 to 7.0.3 ([6fbd188](https://github.com/wmfs/statebox/commit/6fbd188))
* **deps-dev:** update nyc requirement from 12.0.2 to 13.0.1 ([414cba4](https://github.com/wmfs/statebox/commit/414cba4))
* **deps-dev:** update semantic-release requirement from 15.9.11 to 15.9.12 ([cd3f927](https://github.com/wmfs/statebox/commit/cd3f927))
* **deps-dev:** update semantic-release requirement from 15.9.3 to 15.9.5 ([a2ea09c](https://github.com/wmfs/statebox/commit/a2ea09c))
* **deps-dev:** update semantic-release requirement from 15.9.5 to 15.9.6 ([f968e4d](https://github.com/wmfs/statebox/commit/f968e4d))
* **deps-dev:** update semantic-release requirement from 15.9.6 to 15.9.7 ([accea41](https://github.com/wmfs/statebox/commit/accea41))
* **deps-dev:** update semantic-release requirement from 15.9.7 to 15.9.8 ([e1fd725](https://github.com/wmfs/statebox/commit/e1fd725))
* **deps-dev:** update semantic-release requirement from 15.9.8 to 15.9.9 ([84cfe20](https://github.com/wmfs/statebox/commit/84cfe20))
* **deps-dev:** update semantic-release requirement from 15.9.9 to 15.9.11 ([3d9246c](https://github.com/wmfs/statebox/commit/3d9246c))
* **deps-dev:** update semantic-release requirement to 15.9.2 ([8432701](https://github.com/wmfs/statebox/commit/8432701))
* **deps-dev:** update semantic-release requirement to 15.9.3 ([5879742](https://github.com/wmfs/statebox/commit/5879742))
* **deps-dev:** update standard requirement from 11.0.1 to 12.0.1 ([1412ff3](https://github.com/wmfs/statebox/commit/1412ff3))


### 📦 Code Refactoring

* findStates uses native JavaScript methods rather than lodash ([38bd1f9](https://github.com/wmfs/statebox/commit/38bd1f9))
* Not being invoked with callback parameters, so take out all the dead code that handles tha ([c3411bd](https://github.com/wmfs/statebox/commit/c3411bd))
* Pulled parseStateMachines out of createStateMachine ([3cda783](https://github.com/wmfs/statebox/commit/3cda783))
* Remote stateMachineMeta as a parameter to CreateStateMachine ([893ec7f](https://github.com/wmfs/statebox/commit/893ec7f))
* Remove stateMachineMeta as a parameter to StateMachine.init ([64e2fa2](https://github.com/wmfs/statebox/commit/64e2fa2))
* Reworked index.js so it no longer needs lodash ([c3fd879](https://github.com/wmfs/statebox/commit/c3fd879))


### 🚨 Tests

* Correct paths so we can pick up MemoryModel and MemoryStorageService if available. ([7369072](https://github.com/wmfs/statebox/commit/7369072))


### ♻️ Chores

* codecov 3.0.3 -> 3.0.4 ([b22f596](https://github.com/wmfs/statebox/commit/b22f596))


### 💎 Styles

* Standards fix ([ff0312d](https://github.com/wmfs/statebox/commit/ff0312d))

## [1.3.2](https://github.com/wmfs/statebox/compare/v1.3.1...v1.3.2) (2018-07-30)


### 🐛 Bug Fixes

* Parallel States and aggregated results Issue [#20](https://github.com/wmfs/statebox/issues/20) ([f31b19a](https://github.com/wmfs/statebox/commit/f31b19a))


### 🛠 Builds

* **deps-dev:** update semantic-release requirement to 15.9.1 ([fc37ddd](https://github.com/wmfs/statebox/commit/fc37ddd))


### 📦 Code Refactoring

* Remove log ([b17eb0f](https://github.com/wmfs/statebox/commit/b17eb0f))

## [1.3.1](https://github.com/wmfs/statebox/compare/v1.3.0...v1.3.1) (2018-07-26)


### 🐛 Bug Fixes

* Issue [#20](https://github.com/wmfs/statebox/issues/20): Parallel States and aggregated results ([97dab42](https://github.com/wmfs/statebox/commit/97dab42))

# [1.3.0](https://github.com/wmfs/statebox/compare/v1.2.1...v1.3.0) (2018-07-19)


### 🛠 Builds

* **deps:** update [@wmfs](https://github.com/wmfs)/asl-choice-processor requirement to 1.2.0 ([867b6d4](https://github.com/wmfs/statebox/commit/867b6d4))
* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/changelog requirement to 2.1.2 ([ae7526f](https://github.com/wmfs/statebox/commit/ae7526f))
* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/changelog requirement to 3.0.0 ([e64b4ac](https://github.com/wmfs/statebox/commit/e64b4ac))
* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/git requirement to 6.0.2 ([52ddf3e](https://github.com/wmfs/statebox/commit/52ddf3e))
* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/git requirement to 7.0.0 ([c3b7283](https://github.com/wmfs/statebox/commit/c3b7283))
* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/git requirement to 7.0.1 ([465f0a5](https://github.com/wmfs/statebox/commit/465f0a5))
* **deps-dev:** update semantic-release requirement to 15.7.2 ([a1f0071](https://github.com/wmfs/statebox/commit/a1f0071))
* **deps-dev:** update semantic-release requirement to 15.8.0 ([78ff6b3](https://github.com/wmfs/statebox/commit/78ff6b3))
* **deps-dev:** update semantic-release requirement to 15.8.1 ([1396ba9](https://github.com/wmfs/statebox/commit/1396ba9))


### ⚙️ Continuous Integrations

* remove deps-dev scoping release ([cc90cf3](https://github.com/wmfs/statebox/commit/cc90cf3))


### 💎 Styles

* remove comma ([895186c](https://github.com/wmfs/statebox/commit/895186c))
