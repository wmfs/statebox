const _ = require('lodash')

class ModuleResource {
  constructor (resourceClass, resourceConfig, stateMachineName) {
    this.ResourceClass = resourceClass
    this.ResourceConfig = resourceConfig
    this.stateMachineName = stateMachineName
  }

  init (env) {
    this.resource = new this.ResourceClass()
    this.resourceExpectsDoneCallback = this.resource.run.length === 3

    return this.resourceInit(this.resource, env)
  }

  async resourceInit (resource, env) {
    if (!_.isFunction(resource.init)) {
      return
    }

    const args = [
      this.ResourceConfig || { },
      env
    ]

    await resource.init(...args)

    this.resourceConfigure(resource)
  } // resourceInit

  resourceConfigure (resource) {
    const requiredConfig = _.get(resource, 'schema.required')

    if (!requiredConfig) {
      return // nothing more to do
    }

    if (!this.ResourceConfig) {
      throw new Error(`State machine '${this.stateMachineName}' is missing a ResourceConfig`)
    }

    const configProperties = resource.schema.properties
    const validators = {
      object: _.isPlainObject,
      string: _.isString
    }
    const allPropertyNames = Object.keys(this.ResourceConfig)

    for (const propertyName of requiredConfig) {
      if (!allPropertyNames.includes(propertyName)) {
        throw new Error(`Resource Config missing required properties in stateMachine '${this.stateMachineName}'`)
      }

      const propertyValue = this.ResourceConfig[propertyName]
      const type = configProperties[propertyName].type
      const validator = validators[type]

      if (validator && !validator(propertyValue)) {
        throw new Error(`Resource config property '${propertyName}' in stateMachine '${this.stateMachineName}' should be of type ${type}`)
      }
    } // for ...
  } // resourceConfigure

  run (input, context, optionalDoneCallback) {
    this.resource.run(input, context, optionalDoneCallback)
  }
} // class ModuleResource

module.exports = ModuleResource
