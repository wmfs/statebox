const StorageDao = require('../lib/dao/StorageService-dao')

let messages = null
try {
  messages = require('../../tymly-core/lib/startup-messages/index')()
} catch (err) {
  console.log('Startup messages not available')
}

function DaosToTest () {
  const daos = [['built in DAO', null, null]]

  // Memory Storage?
  try {
    const MemoryModel = require('../../tymly-core/lib/plugin/components/services/storage/Memory-model')
    const model = new MemoryModel(StorageDao.ExecutionModelDefinition)
    daos.push([
      'in-memory storage dao', new StorageDao(model), null
    ])
  } catch (err) {
    console.log('MemoryModel not available')
  }
  try {
    const MemoryStorageServiceClass = require('../../tymly-core/lib/plugin/components/services/storage/index').serviceClass
    const memoryStorageService = new MemoryStorageServiceClass()
    memoryStorageService.boot({ blueprintComponents: {}, messages }, () => {})
    daos.push([
      'memory storage service', null, memoryStorageService
    ])
  } catch (err) {
    console.log('MemoryStorageService not available')
  }
  try {
    const PGStorageServiceClass = require('../../../plugins/tymly-pg-plugin/lib/components/services/storage/index').serviceClass
    const pgStorageService = new PGStorageServiceClass()
    pgStorageService.boot({ blueprintComponents: {}, messages, config: {} }, () => {})
    daos.push([
      'Postgres storage service', null, pgStorageService
    ])
  } catch (err) {
    console.log('PGStorageService not available')
  }

  return daos
}

process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error)
})

module.exports = DaosToTest().map(([name, dao, storageService]) => {
  return [name, {
    dao,
    bootedServices: {
      storage: storageService
    }
  }
  ]
}
)
