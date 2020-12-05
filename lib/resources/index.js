class Resources {
  constructor () {
    this.resolvers = new Map()
  }

  resolve (resource, resourceConfig, stateMachineName) {
    if (!resource) {
      throw new Error('No \'Resource\' property set?')
    }

    const parts = [...resource.split(':'), '']
    const resourceType = parts[0].trim()
    const resourceName = parts[1].trim()

    const resolver = this.resolvers.get(resourceType)

    if (!resolver) {
      throw new Error(`Unknown resource type '${resourceType}' in '${resource}'`)
    }

    return resolver(resourceName, resourceConfig, stateMachineName)
  } // resolveResource

  registerResolver (resourceType, resolver) {
    this.resolvers.set(resourceType, resolver)
  } // registerResolver
} // class Resources

module.exports = () => new Resources()
