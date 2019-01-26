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

function resolve (resource, resourceConfig, stateMachineName) {
  if (resource) {
    const parts = resource.split(':')
    const resourceType = parts[0]
    switch (resourceType) {
      case 'module':
        const moduleName = parts[1]
        const resourceClass = findModuleByName(moduleName)
        if (!resourceClass) {
          // Should be picked-up by stateMachine validation before now
          throw new Error(`Module class '${moduleName}' not found`)
        }

        return new ModuleResource(resourceClass, resourceConfig, stateMachineName)
      default:
        throw new Error(`Unknown resource type '${resourceType}'`)
    }
  } else {
    throw new Error('No \'Resource\' property set?')
  }
} // resolveResource

module.exports = {
  createModule,
  createModules,
  findModuleByName,
  listModules,
  resolve
}
