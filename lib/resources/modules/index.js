const debug = require('debug')('statebox')
const ModuleResource = require('./ModuleResource')

class Modules {
  constructor () {
    this.moduleClasses = new Map()
  }

  createModule (moduleName, moduleClass) {
    this.moduleClasses.set(moduleName, moduleClass)
    debug(`Add module class '${moduleName}'`)
  }

  createModules (resourceModules) {
    for (const [moduleName, moduleClass] of Object.entries(resourceModules)) {
      this.createModule(moduleName, moduleClass)
    }
  }

  findModuleByName (name) {
    return this.moduleClasses.get(name)
  }

  listModules () {
    return [...this.moduleClasses.keys()]
  }

  moduleResolver (moduleName, resourceConfig, stateMachineName) {
    const resourceClass = this.findModuleByName(moduleName)
    if (!resourceClass) {
      // Should be picked-up by stateMachine validation before now
      throw new Error(`Module class '${moduleName}' not found`)
    }

    return new ModuleResource(resourceClass, resourceConfig, stateMachineName)
  } // moduleResolver

  get resolver () {
    return (moduleName, resourceConfig, stateMachineName) =>
      this.moduleResolver(moduleName, resourceConfig, stateMachineName)
  }
} // class Modules

module.exports = () => new Modules()
