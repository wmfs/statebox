const debug = require('debug')('statebox')
const ModuleResource = require('./ModuleResource')

const moduleClasses = new Map()

function createModule (moduleName, moduleClass) {
  moduleClasses.set(moduleName, moduleClass)
  debug(`Add module class '${moduleName}'`)
}

function createModules (resourceModules) {
  for (const [moduleName, moduleClass] of Object.entries(resourceModules)) {
    this.createModule(moduleName, moduleClass)
  }
}

function findModuleByName (name) {
  return moduleClasses.get(name)
}

function listModules () {
  return [...moduleClasses.keys()]
}

function moduleResolver (moduleName, resourceConfig, stateMachineName) {
  const resourceClass = findModuleByName(moduleName)
  if (!resourceClass) {
    // Should be picked-up by stateMachine validation before now
    throw new Error(`Module class '${moduleName}' not found`)
  }

  return new ModuleResource(resourceClass, resourceConfig, stateMachineName)
} // moduleResolver

module.exports = {
  createModule,
  createModules,
  findModuleByName,
  listModules,
  moduleResolver
}
