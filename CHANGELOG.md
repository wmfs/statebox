## [1.44.1](https://github.com/wmfs/statebox/compare/v1.44.0...v1.44.1) (2019-01-26)


### 🐛 Bug Fixes

* Removed Statebox.validateStateMachineDefinition ([8a497d3](https://github.com/wmfs/statebox/commit/8a497d3))


### 📦 Code Refactoring

* Name tweaks ([89d6beb](https://github.com/wmfs/statebox/commit/89d6beb))
* State Machine helpers to we make one call not two, and don't fish around inside StateMachi ([278aaf5](https://github.com/wmfs/statebox/commit/278aaf5))

# [1.44.0](https://github.com/wmfs/statebox/compare/v1.43.0...v1.44.0) (2019-01-26)


### ✨ Features

* Added Statebox.registerResourceResolver ([212f952](https://github.com/wmfs/statebox/commit/212f952))


### 📦 Code Refactoring

* Move resource resolution and ModuleResource into resources/ and out of Task completely ([7c38d3c](https://github.com/wmfs/statebox/commit/7c38d3c))
* Pop Modules off by themselves ([e8fc5f1](https://github.com/wmfs/statebox/commit/e8fc5f1))
* Pull all the module initialisation stuff out into a helper class ([4b907a0](https://github.com/wmfs/statebox/commit/4b907a0))
* Pull resource resolution out of the Task constructor ([7aff1a1](https://github.com/wmfs/statebox/commit/7aff1a1))
* Pulled module resolution out of resolve, paving way for additional resource resolvers ([9a0147f](https://github.com/wmfs/statebox/commit/9a0147f))

# [1.43.0](https://github.com/wmfs/statebox/compare/v1.42.0...v1.43.0) (2019-01-25)


### ✨ Features

* Initial Parameters implementation ([35fc6d5](https://github.com/wmfs/statebox/commit/35fc6d5))
* Parameter implementation, including reference path evaluation and field replacement ([9e51a67](https://github.com/wmfs/statebox/commit/9e51a67))
* Raise States.ParameterPathFailure if JSONPath returns no Extracted Value ([53b49fe](https://github.com/wmfs/statebox/commit/53b49fe))


### 🐛 Bug Fixes

* Parameters Extracted Value can be multi-valued arrays, as well as atomic values. ([1cd1d6c](https://github.com/wmfs/statebox/commit/1cd1d6c))
* Use States.TaskFailed instead of literal ([ccd71f1](https://github.com/wmfs/statebox/commit/ccd71f1))


### 📦 Code Refactoring

* Pull out error states. ([915f339](https://github.com/wmfs/statebox/commit/915f339))
* Simplify PathHandler import ([5567ac9](https://github.com/wmfs/statebox/commit/5567ac9))
* Split input/result/output path handlers out from Base-state ([54a09b0](https://github.com/wmfs/statebox/commit/54a09b0))
* Tidy up Task.Context.resolveInputPaths ([f9b7c47](https://github.com/wmfs/statebox/commit/f9b7c47))
* Use ErrorStates instead of literals. ([3de299a](https://github.com/wmfs/statebox/commit/3de299a))


### 📚 Documentation

* Update README to reference statelint. ([26bdbe5](https://github.com/wmfs/statebox/commit/26bdbe5))


### 🚨 Tests

* Initial tests for Parameters field ([478342f](https://github.com/wmfs/statebox/commit/478342f))
* Tests for Parameters with reference path evaluation ([5cf87b2](https://github.com/wmfs/statebox/commit/5cf87b2))


### 💎 Styles

* Lint fixes ([fdb6caf](https://github.com/wmfs/statebox/commit/fdb6caf))

# [1.42.0](https://github.com/wmfs/statebox/compare/v1.41.0...v1.42.0) (2019-01-17)


### ✨ Features

* Expose findModuleByName method. ([0acc380](https://github.com/wmfs/statebox/commit/0acc380))


### 🛠 Builds

* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/git requirement ([b06db72](https://github.com/wmfs/statebox/commit/b06db72))
* **deps-dev:** update semantic-release requirement ([79c6183](https://github.com/wmfs/statebox/commit/79c6183))


### 📦 Code Refactoring

* in deserialise(), surround JSON.parse in try/catch in case the incoming ctx/executionOptions are strings ([3ea2de5](https://github.com/wmfs/statebox/commit/3ea2de5))

# [1.41.0](https://github.com/wmfs/statebox/compare/v1.40.0...v1.41.0) (2018-12-19)


### ✨ Features

* Parallel State works as per spec ([3554a27](https://github.com/wmfs/statebox/commit/3554a27))


### 🐛 Bug Fixes

* Correct implementation of failed branch handling ([3919a95](https://github.com/wmfs/statebox/commit/3919a95))
* Handle Catch in Parallel branches properly. ([ebd3e75](https://github.com/wmfs/statebox/commit/ebd3e75))
* Set Task Context stateMachineMeta ([1c95c7d](https://github.com/wmfs/statebox/commit/1c95c7d))
* Strip out ParallelBranchTracker and fold into Base-state ([32a08c0](https://github.com/wmfs/statebox/commit/32a08c0))
* Use per-branch parallel context ([48d767c](https://github.com/wmfs/statebox/commit/48d767c))
* When a Parallel branch completes, run processTaskSuccess on the correct object ([c5c58d9](https://github.com/wmfs/statebox/commit/c5c58d9))


### 🛠 Builds

* **deps:** update boom requirement from 7.2.2 to 7.3.0 ([f8cff0a](https://github.com/wmfs/statebox/commit/f8cff0a))
* **deps:** update deepmerge requirement from 2.2.1 to 3.0.0 ([ae08ba8](https://github.com/wmfs/statebox/commit/ae08ba8))
* **deps:** update luxon requirement from 1.8.1 to 1.8.2 ([2f464a0](https://github.com/wmfs/statebox/commit/2f464a0))
* **deps-dev:** update semantic-release requirement ([201d426](https://github.com/wmfs/statebox/commit/201d426))


### 📦 Code Refactoring

* Use const for number of state machines we run in the parallel tests ([af4b8c3](https://github.com/wmfs/statebox/commit/af4b8c3))


### 🚨 Tests

* Add FunWithMath test ([cfde7d7](https://github.com/wmfs/statebox/commit/cfde7d7))
* Additional Parallel state tests with various levels of nesting. ([168ebbe](https://github.com/wmfs/statebox/commit/168ebbe))
* Extra parallel state machine with failing branches tests ([f85cfa7](https://github.com/wmfs/statebox/commit/f85cfa7))
* Remove some console.log output ([5965907](https://github.com/wmfs/statebox/commit/5965907))
* Removed more console.log noise ([18e9e81](https://github.com/wmfs/statebox/commit/18e9e81))
* Tests covering input and result path for Parallel states ([176f2d1](https://github.com/wmfs/statebox/commit/176f2d1))


### ♻️ Chores

* **release:** 1.37.2 [skip ci] ([ef61846](https://github.com/wmfs/statebox/commit/ef61846))
* **release:** 1.37.3 [skip ci] ([1bac62c](https://github.com/wmfs/statebox/commit/1bac62c))
* **release:** 1.38.0 [skip ci] ([9ef4715](https://github.com/wmfs/statebox/commit/9ef4715))
* **release:** 1.39.0 [skip ci] ([ce6b51c](https://github.com/wmfs/statebox/commit/ce6b51c))

# [1.40.0](https://github.com/wmfs/statebox/compare/v1.39.1...v1.40.0) (2018-12-11)


### 🐛 Bug Fixes

* Pull in asl-choice-processor update so Choice doesn't explode on empty input. ([ee2d80d](https://github.com/wmfs/statebox/commit/ee2d80d))


### 🛠 Builds

* **deps:** update [@wmfs](https://github.com/wmfs)/asl-choice-processor requirement ([2fea4fe](https://github.com/wmfs/statebox/commit/2fea4fe))

## [1.39.1](https://github.com/wmfs/statebox/compare/v1.39.0...v1.39.1) (2018-12-11)


### 🐛 Bug Fixes

* When nothing matches in a Choice state, return a States.NoChoiceMatched error ([ab4a0b9](https://github.com/wmfs/statebox/commit/ab4a0b9))


### 🚨 Tests

* Remove duplicate fail state tests ([da119d3](https://github.com/wmfs/statebox/commit/da119d3))

# [1.39.0](https://github.com/wmfs/statebox/compare/v1.38.0...v1.39.0) (2018-12-06)


### 🛠 Builds

* **deps:** update deepmerge requirement from 2.2.1 to 3.0.0 ([b9de373](https://github.com/wmfs/statebox/commit/b9de373))

# [1.38.0](https://github.com/wmfs/statebox/compare/v1.37.3...v1.38.0) (2018-12-06)


### 🛠 Builds

* **deps:** update boom requirement from 7.2.2 to 7.3.0 ([fc0246a](https://github.com/wmfs/statebox/commit/fc0246a))
* **deps:** update luxon requirement from 1.8.1 to 1.8.2 ([19db482](https://github.com/wmfs/statebox/commit/19db482))
* **deps-dev:** update semantic-release requirement ([930f7a6](https://github.com/wmfs/statebox/commit/930f7a6))

## [1.37.3](https://github.com/wmfs/statebox/compare/v1.37.2...v1.37.3) (2018-12-06)


### 🐛 Bug Fixes

* Set Task Context stateMachineMeta ([237716b](https://github.com/wmfs/statebox/commit/237716b))

## [1.37.2](https://github.com/wmfs/statebox/compare/v1.37.1...v1.37.2) (2018-12-04)


### 🐛 Bug Fixes

* Return executionDescription back out of setTaskFailure ([e765f13](https://github.com/wmfs/statebox/commit/e765f13))
* Round-trip errors through the Dao correctly. ([5c1c8c5](https://github.com/wmfs/statebox/commit/5c1c8c5))


### 📦 Code Refactoring

* convertJsonpathToDottie is always called with a valid jsonpath, and never supplied with a ([93f2aee](https://github.com/wmfs/statebox/commit/93f2aee))
* Simplified implementation to avoid slicing strings multiple times ([d1044b0](https://github.com/wmfs/statebox/commit/d1044b0))


### 🚨 Tests

* Check for not existing rather than undefined ([04ec24a](https://github.com/wmfs/statebox/commit/04ec24a))
* Move Fail State test into it's own file ([e7a3a09](https://github.com/wmfs/statebox/commit/e7a3a09))
* Pulled Wait State tests out into their own file ([b4029ab](https://github.com/wmfs/statebox/commit/b4029ab))


### 💎 Styles

* standard.js fixes ([a62c51d](https://github.com/wmfs/statebox/commit/a62c51d))

## [1.37.1](https://github.com/wmfs/statebox/compare/v1.37.0...v1.37.1) (2018-12-04)


### 🐛 Bug Fixes

* Propogate promise out of Task.processState so we can await of revivication ([0142233](https://github.com/wmfs/statebox/commit/0142233))


### 📦 Code Refactoring

* Switch out a couple of start up tests for before() { ... } ([eb52187](https://github.com/wmfs/statebox/commit/eb52187))
* use before instead of tests ([6df08f3](https://github.com/wmfs/statebox/commit/6df08f3))
* **test:** use before/after instead of tests ([eacb606](https://github.com/wmfs/statebox/commit/eacb606))
* **test:** user before instead of setup tests ([bfd88dd](https://github.com/wmfs/statebox/commit/bfd88dd))


### 🚨 Tests

* Move Parallel State tests into separate file ([84e2ad1](https://github.com/wmfs/statebox/commit/84e2ad1))
* Move Wait State tests into their own file ([da5b83e](https://github.com/wmfs/statebox/commit/da5b83e))
* Pull Fail state out into own test file ([f8fc0c7](https://github.com/wmfs/statebox/commit/f8fc0c7))
* Test with PGStorageService if available ([62a4b8b](https://github.com/wmfs/statebox/commit/62a4b8b))

# [1.37.0](https://github.com/wmfs/statebox/compare/v1.36.0...v1.37.0) (2018-11-27)


### 🛠 Builds

* **deps:** update luxon requirement from 1.8.0 to 1.8.1 ([fcd80b4](https://github.com/wmfs/statebox/commit/fcd80b4))
* **deps-dev:** update semantic-release requirement ([2cfe4cb](https://github.com/wmfs/statebox/commit/2cfe4cb))

# [1.36.0](https://github.com/wmfs/statebox/compare/v1.35.0...v1.36.0) (2018-11-23)


### 🛠 Builds

* **deps:** update luxon requirement from 1.7.1 to 1.8.0 ([679ae32](https://github.com/wmfs/statebox/commit/679ae32))
* **deps-dev:** update semantic-release requirement ([e21415d](https://github.com/wmfs/statebox/commit/e21415d))

# [1.35.0](https://github.com/wmfs/statebox/compare/v1.34.3...v1.35.0) (2018-11-17)


### 🛠 Builds

* **deps:** update luxon requirement from 1.6.2 to 1.7.1 ([355bb56](https://github.com/wmfs/statebox/commit/355bb56))

## [1.34.3](https://github.com/wmfs/statebox/compare/v1.34.2...v1.34.3) (2018-11-15)


### 🐛 Bug Fixes

* pass the state machine title out on list ([aa07c74](https://github.com/wmfs/statebox/commit/aa07c74))


### 🛠 Builds

* **deps-dev:** update semantic-release requirement ([dd6c84c](https://github.com/wmfs/statebox/commit/dd6c84c))

## [1.34.2](https://github.com/wmfs/statebox/compare/v1.34.1...v1.34.2) (2018-11-14)


### 🐛 Bug Fixes

* return more data on list state machines, as it was before ([049794c](https://github.com/wmfs/statebox/commit/049794c))


### 🛠 Builds

* **deps-dev:** update semantic-release requirement ([8910bff](https://github.com/wmfs/statebox/commit/8910bff))

## [1.34.1](https://github.com/wmfs/statebox/compare/v1.34.0...v1.34.1) (2018-11-12)


### 🐛 Bug Fixes

* **listStateMachines returns name, description:** Rather than direct access to the whole state machi ([276286c](https://github.com/wmfs/statebox/commit/276286c))
* Added listModuleResources, providing the names of the available resources ([1fa9df4](https://github.com/wmfs/statebox/commit/1fa9df4))

# [1.34.0](https://github.com/wmfs/statebox/compare/v1.33.0...v1.34.0) (2018-11-10)


### 🛠 Builds

* **deps:** update luxon requirement from 1.6.1 to 1.6.2 ([3590bfb](https://github.com/wmfs/statebox/commit/3590bfb))

# [1.33.0](https://github.com/wmfs/statebox/compare/v1.32.0...v1.33.0) (2018-11-10)


### 🛠 Builds

* **deps:** update luxon requirement from 1.6.0 to 1.6.1 ([5f7019c](https://github.com/wmfs/statebox/commit/5f7019c))

# [1.32.0](https://github.com/wmfs/statebox/compare/v1.31.0...v1.32.0) (2018-11-10)


### 🛠 Builds

* **deps:** update luxon requirement from 1.5.0 to 1.6.0 ([6309ecc](https://github.com/wmfs/statebox/commit/6309ecc))
* **deps-dev:** update semantic-release requirement ([110837a](https://github.com/wmfs/statebox/commit/110837a))

# [1.31.0](https://github.com/wmfs/statebox/compare/v1.30.0...v1.31.0) (2018-11-04)


### 🛠 Builds

* **deps:** update luxon requirement from 1.4.6 to 1.5.0 ([1630405](https://github.com/wmfs/statebox/commit/1630405))

# [1.30.0](https://github.com/wmfs/statebox/compare/v1.29.0...v1.30.0) (2018-11-03)


### 🛠 Builds

* **deps:** update luxon requirement from 1.4.5 to 1.4.6 ([6d15874](https://github.com/wmfs/statebox/commit/6d15874))

# [1.29.0](https://github.com/wmfs/statebox/compare/v1.28.0...v1.29.0) (2018-11-03)


### 🛠 Builds

* **deps:** update [@wmfs](https://github.com/wmfs)/asl-choice-processor requirement ([62e65e2](https://github.com/wmfs/statebox/commit/62e65e2))

# [1.28.0](https://github.com/wmfs/statebox/compare/v1.27.0...v1.28.0) (2018-11-03)


### 🛠 Builds

* **deps:** update boom requirement from 7.2.1 to 7.2.2 ([d46cde8](https://github.com/wmfs/statebox/commit/d46cde8))
* **deps-dev:** update semantic-release requirement ([cd7da7f](https://github.com/wmfs/statebox/commit/cd7da7f))

# [1.27.0](https://github.com/wmfs/statebox/compare/v1.26.0...v1.27.0) (2018-11-01)


### 🛠 Builds

* **deps:** update [@wmfs](https://github.com/wmfs)/asl-choice-processor requirement ([0af404d](https://github.com/wmfs/statebox/commit/0af404d))

# [1.26.0](https://github.com/wmfs/statebox/compare/v1.25.0...v1.26.0) (2018-11-01)


### 🛠 Builds

* **deps:** update boom requirement from 7.2.0 to 7.2.1 ([a69fe59](https://github.com/wmfs/statebox/commit/a69fe59))

# [1.25.0](https://github.com/wmfs/statebox.git/compare/v1.24.0...v1.25.0) (2018-10-31)


### 🛠 Builds

* **deps:** update luxon requirement from 1.4.4 to 1.4.5 ([46930df](https://github.com/wmfs/statebox.git/commit/46930df))
* **deps-dev:** update semantic-release requirement ([8fb3564](https://github.com/wmfs/statebox.git/commit/8fb3564))

# [1.24.0](https://github.com/wmfs/statebox/compare/v1.23.1...v1.24.0) (2018-10-23)


### 🛠 Builds

* **deps:** update dottie requirement from 2.0.0 to 2.0.1 ([4ca1490](https://github.com/wmfs/statebox/commit/4ca1490))
* **deps-dev:** update semantic-release requirement ([2b34863](https://github.com/wmfs/statebox/commit/2b34863))
* **deps-dev:** update semantic-release requirement ([5f1fe12](https://github.com/wmfs/statebox/commit/5f1fe12))


### 🚨 Tests

* Pull Choice Tests out into their own file ([76e832a](https://github.com/wmfs/statebox/commit/76e832a))

## [1.23.1](https://github.com/wmfs/statebox/compare/v1.23.0...v1.23.1) (2018-10-19)


### 🐛 Bug Fixes

* Ensure Succeed states end the state machine ([92fb5b5](https://github.com/wmfs/statebox/commit/92fb5b5))
* InputPath is applied to all state types. ([2b9eab6](https://github.com/wmfs/statebox/commit/2b9eab6))
* OutputPath is applied to all state types ([d87dc11](https://github.com/wmfs/statebox/commit/d87dc11))


### 📦 Code Refactoring

* Reordered BaseState methods. Moved updateCurrentStateName into Choice. ([b33f03e](https://github.com/wmfs/statebox/commit/b33f03e))


### 🚨 Tests

* Commented out test cases which capture Spec behaviour we don't currently support. ([1fad6c0](https://github.com/wmfs/statebox/commit/1fad6c0))
* Succeed State tests ([f5011c8](https://github.com/wmfs/statebox/commit/f5011c8))

# [1.23.0](https://github.com/wmfs/statebox/compare/v1.22.0...v1.23.0) (2018-10-19)


### 🛠 Builds

* **deps:** update luxon requirement from 1.4.3 to 1.4.4 ([fa431b4](https://github.com/wmfs/statebox/commit/fa431b4))

# [1.22.0](https://github.com/wmfs/statebox/compare/v1.21.0...v1.22.0) (2018-10-19)


### ✨ Features

* Choice state respects InputPath. Support InputPath === null in Choice and Task. ([640f7cf](https://github.com/wmfs/statebox/commit/640f7cf))
* Implement Wait with SecondsPath, Timestamp, and TimestampPath ([784cf18](https://github.com/wmfs/statebox/commit/784cf18))


### 🐛 Bug Fixes

* Default options to {}, so new Statebox() works ([527f79b](https://github.com/wmfs/statebox/commit/527f79b))
* Further work on InputPath and ResultPath behaviour ([42d6f83](https://github.com/wmfs/statebox/commit/42d6f83))
* Handle ResultPath === null correctly ([865a75d](https://github.com/wmfs/statebox/commit/865a75d))
* Wait state properly applies InputPath ([4595da9](https://github.com/wmfs/statebox/commit/4595da9))


### 🛠 Builds

* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/changelog requirement ([eea1a9b](https://github.com/wmfs/statebox/commit/eea1a9b))
* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/git requirement ([237936e](https://github.com/wmfs/statebox/commit/237936e))
* **deps-dev:** update express requirement from 4.16.3 to 4.16.4 ([f7b997b](https://github.com/wmfs/statebox/commit/f7b997b))
* **deps-dev:** update nyc requirement from 13.0.1 to 13.1.0 ([0931951](https://github.com/wmfs/statebox/commit/0931951))
* **deps-dev:** update semantic-release requirement ([7cc7d5d](https://github.com/wmfs/statebox/commit/7cc7d5d))


### 📚 Documentation

* **README:** Add logo to README ([f9d1398](https://github.com/wmfs/statebox/commit/f9d1398))


### 🚨 Tests

* Better Top-level test names ([a13819f](https://github.com/wmfs/statebox/commit/a13819f))
* Commented out test cases which capture Spec behaviour we don't currently support. ([d170cfc](https://github.com/wmfs/statebox/commit/d170cfc))
* Correct test now wait tests aren't using module:hello ([e5cb7c7](https://github.com/wmfs/statebox/commit/e5cb7c7))
* Ensure statebox is properly initialised ([3fec7a8](https://github.com/wmfs/statebox/commit/3fec7a8))
* Move tests of core states out into separate test file ([dabe237](https://github.com/wmfs/statebox/commit/dabe237))
* Remove restrictions element from all state machine fixtures ([dda54c2](https://github.com/wmfs/statebox/commit/dda54c2))
* Reorder state tests to match the state type order in the spec ([5f20452](https://github.com/wmfs/statebox/commit/5f20452))
* Split Pass tests out into a separate file ([8e115f4](https://github.com/wmfs/statebox/commit/8e115f4))
* Test Pass with all combinations of Result and ResultPath ([a155bb3](https://github.com/wmfs/statebox/commit/a155bb3))
* Test Wait with timestamp in the past, or with -ve SecondsPath value ([1a8b656](https://github.com/wmfs/statebox/commit/1a8b656))


### 💎 Styles

* standard.js fixes ([9152da3](https://github.com/wmfs/statebox/commit/9152da3))
* Standards fix ([6cb5a39](https://github.com/wmfs/statebox/commit/6cb5a39))

# [1.21.0](https://github.com/wmfs/statebox/compare/v1.20.0...v1.21.0) (2018-10-08)


### 🛠 Builds

* **deps:** update [@wmfs](https://github.com/wmfs)/asl-choice-processor requirement ([cb8f0c0](https://github.com/wmfs/statebox/commit/cb8f0c0))

# [1.20.0](https://github.com/wmfs/statebox/compare/v1.19.0...v1.20.0) (2018-10-08)


### 🛠 Builds

* **deps:** update debug requirement from 4.0.1 to 4.1.0 ([9b3c05e](https://github.com/wmfs/statebox/commit/9b3c05e))
* **deps-dev:** update semantic-release requirement ([74e2f23](https://github.com/wmfs/statebox/commit/74e2f23))

# [1.19.0](https://github.com/wmfs/statebox/compare/v1.18.0...v1.19.0) (2018-10-03)


### 🛠 Builds

* **deps:** update deepmerge requirement from 2.2.0 to 2.2.1 ([b592292](https://github.com/wmfs/statebox/commit/b592292))

# [1.18.0](https://github.com/wmfs/statebox/compare/v1.17.0...v1.18.0) (2018-10-03)


### 🛠 Builds

* **deps:** update deepmerge requirement from 2.1.1 to 2.2.0 ([2fdf054](https://github.com/wmfs/statebox/commit/2fdf054))
* **deps-dev:** update chai requirement from 4.1.2 to 4.2.0 ([cf9a8ab](https://github.com/wmfs/statebox/commit/cf9a8ab))

# [1.17.0](https://github.com/wmfs/statebox/compare/v1.16.0...v1.17.0) (2018-09-26)


### ✨ Features

* Complete Succeed state implmentation ([59f14c5](https://github.com/wmfs/statebox/commit/59f14c5))


### 💎 Styles

* Standards fix ([df7c60b](https://github.com/wmfs/statebox/commit/df7c60b))

# [1.16.0](https://github.com/wmfs/statebox/compare/v1.15.0...v1.16.0) (2018-09-25)


### ✨ Features

* **$browser!:** Switch from process.nextTick to Promise.resolve().then ... ([0b974b4](https://github.com/wmfs/statebox/commit/0b974b4))


### 🐛 Bug Fixes

* **Memory-dao:** Remove unused getBranchSummary method ([c582019](https://github.com/wmfs/statebox/commit/c582019))


### 🛠 Builds

* **deps-dev:** update semantic-release requirement ([c755da4](https://github.com/wmfs/statebox/commit/c755da4))

# [1.15.0](https://github.com/wmfs/statebox/compare/v1.14.0...v1.15.0) (2018-09-12)


### 🛠 Builds

* **deps:** update [@wmfs](https://github.com/wmfs)/asl-choice-processor requirement ([e51639f](https://github.com/wmfs/statebox/commit/e51639f))

# [1.14.0](https://github.com/wmfs/statebox/compare/v1.13.0...v1.14.0) (2018-09-12)


### 🛠 Builds

* **deps:** update lodash requirement from 4.17.10 to 4.17.11 ([178b8e6](https://github.com/wmfs/statebox/commit/178b8e6))

# [1.13.0](https://github.com/wmfs/statebox/compare/v1.12.0...v1.13.0) (2018-09-12)


### ✨ Features

* Improve sendTaskFailure handling ([30e730a](https://github.com/wmfs/statebox/commit/30e730a))


### 🛠 Builds

* **deps-dev:** update semantic-release requirement ([623c8ef](https://github.com/wmfs/statebox/commit/623c8ef))


### 💎 Styles

* Flipped order of failExecution parameters so they are more natural ([c48bb19](https://github.com/wmfs/statebox/commit/c48bb19))

# [1.12.0](https://github.com/wmfs/statebox/compare/v1.11.0...v1.12.0) (2018-09-11)


### 🛠 Builds

* **deps:** update [@wmfs](https://github.com/wmfs)/asl-choice-processor requirement ([824c3a8](https://github.com/wmfs/statebox/commit/824c3a8))

# [1.11.0](https://github.com/wmfs/statebox/compare/v1.10.0...v1.11.0) (2018-09-11)


### 🛠 Builds

* **deps:** update debug requirement from 4.0.0 to 4.0.1 ([6362485](https://github.com/wmfs/statebox/commit/6362485))
* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/git requirement ([ea378cd](https://github.com/wmfs/statebox/commit/ea378cd))

# [1.10.0](https://github.com/wmfs/statebox/compare/v1.9.0...v1.10.0) (2018-09-11)


### 🛠 Builds

* **deps:** update debug requirement from 3.2.3 to 4.0.0 ([423df72](https://github.com/wmfs/statebox/commit/423df72))

# [1.9.0](https://github.com/wmfs/statebox/compare/v1.8.0...v1.9.0) (2018-09-11)


### 🛠 Builds

* **deps:** update [@wmfs](https://github.com/wmfs)/asl-choice-processor requirement ([6b46aac](https://github.com/wmfs/statebox/commit/6b46aac))
* **deps:** update debug requirement from 3.2.1 to 3.2.3 ([3e4a22a](https://github.com/wmfs/statebox/commit/3e4a22a))

# [1.8.0](https://github.com/wmfs/statebox/compare/v1.7.0...v1.8.0) (2018-09-11)


### 🛠 Builds

* **deps:** update [@wmfs](https://github.com/wmfs)/asl-choice-processor requirement ([5f0a9d0](https://github.com/wmfs/statebox/commit/5f0a9d0))

# [1.7.0](https://github.com/wmfs/statebox/compare/v1.6.0...v1.7.0) (2018-09-11)


### 🛠 Builds

* **deps:** update debug requirement from 3.1.0 to 3.2.1 ([72652f8](https://github.com/wmfs/statebox/commit/72652f8))

# [1.6.0](https://github.com/wmfs/statebox/compare/v1.5.0...v1.6.0) (2018-09-10)


### ✨ Features

* Added error details onto executionOptions so they get persisted to storage ([c100290](https://github.com/wmfs/statebox/commit/c100290))

# [1.5.0](https://github.com/wmfs/statebox/compare/v1.4.1...v1.5.0) (2018-09-10)


### ✨ Features

* Add sendTaskRevivifaction method to restart failed state machines ([afc3e09](https://github.com/wmfs/statebox/commit/afc3e09))


### 🐛 Bug Fixes

* Added some console logging to context.sendTaskFailure ([7f51266](https://github.com/wmfs/statebox/commit/7f51266))


### 🛠 Builds

* **deps-dev:** update codecov requirement from 3.0.4 to 3.1.0 ([3c4d8d8](https://github.com/wmfs/statebox/commit/3c4d8d8))
* **deps-dev:** update semantic-release requirement ([da0f6d5](https://github.com/wmfs/statebox/commit/da0f6d5))
* **deps-dev:** update semantic-release requirement ([731db75](https://github.com/wmfs/statebox/commit/731db75))


### 🚨 Tests

* corrected test and standards fixes ([4ae1f3d](https://github.com/wmfs/statebox/commit/4ae1f3d))

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
