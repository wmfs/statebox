const Modules = require('./modules')

const resolvers = new Map([['module', Modules.moduleResolver]])

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

function registerResolver (resourceType, resolver) {
  resolvers.set(resourceType, resolver)
} // registerResolver

module.exports = {
  createModule: Modules.createModule,
  createModules: Modules.createModules,
  findModuleByName: Modules.findModuleByName,
  listModules: Modules.listModules,
  resolve: resolve,
  registerResolver: registerResolver
}
