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

const resolvers = new Map([['module', moduleResolver]])

function resolve (resource, resourceConfig, stateMachineName) {
  if (!resource) {
    throw new Error('No \'Resource\' property set?')
  }

  const parts = resource.split(':')
  const resourceType = parts[0]
  const resourceName = parts[1]

  const resolver = resolvers.get(resourceType)

  if (!resolver) {
    throw new Error(`Unknown resource type '${resourceType}'`)
  }

  return resolver(resourceName, resourceConfig, stateMachineName)
} // resolveResource

module.exports = {
  createModule,
  createModules,
  findModuleByName,
  listModules,
  resolve
}
