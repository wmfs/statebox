const debug = require('debug')('statebox')

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

module.exports = {
  createModule,
  createModules,
  findModuleByName,
  listModules
}
