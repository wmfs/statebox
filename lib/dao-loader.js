const MemoryDao = require('./dao/Memory-dao')
const StorageDao = require('./dao/StorageService-dao')
const debug = require('debug')('statebox')

async function findDao (options) {
  if (options.dao) {
    debug('Using custom Dao')
    return options.dao // custom DAO provided
  }

  const storageDao = await daoFromStorage(options)
  if (storageDao) {
    debug('Using Storage Dao')
    return storageDao
  }

  debug('Using built in MemoryDao')
  return new MemoryDao(options)
} // findDao

async function daoFromStorage (options) {
  if (!options.bootedServices || !options.bootedServices.storage) {
    return null
  }
  try {
    const storage = options.bootedServices.storage
    info(options.messages, `Using storage service ${storage.storageName}`)
    let model = storage.models[StorageDao.ExecutionModelName]
    if (!model) {
      info(options.messages, `Adding model ${StorageDao.ExecutionModelName}`)
      model = await storage.addModel(
        StorageDao.ExecutionModelName,
        StorageDao.ExecutionModelDefinition,
        options.messages
      )
    }
    return new StorageDao(model)
  } catch (err) {
    warning(options.messages, 'Could not get Dao from storage service')
    warning(options.messages, err)
    warning(options.messages, 'Falling back to in-memory Dao')
  }
  return null
} // daoFromStorage

function info (messages, msg) {
  if (messages) {
    messages.info(msg)
  } else {
    console.log(msg)
  }
} // info

function warning (messages, msg) {
  if (messages) {
    info(messages, msg)
    messages.warning(msg)
  } else {
    console.log(msg)
  }
} // warning

module.exports = findDao
