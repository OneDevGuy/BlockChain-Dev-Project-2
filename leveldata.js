/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

function addBlockToDB(key, value) {
  return new Promise((resolve, reject) => {
    db.put(key, value, (error) => {
      if (error) {
        reject(error)
      }

      console.log(`Added block #${key}`)
      resolve(`Added block #${key}`)
    })
  })
}

function getBlockFromDB(key) {
  return new Promise((resolve, reject) => {
    db.get(key, (error, value) => {
      if (error) {
        reject(error)
      }

      resolve(value)
    })
  })
}

function getBlockHeightFromDB() {
  return new Promise((resolve, reject) => {
    let blockHeight = -1

    db.createReadStream().on('data', (data) => {
      blockHeight++
    }).on('error', (error) => {
      reject(error)
    }).on('close', () => {
      resolve(blockHeight)
    })
  })
}


module.exports = {
  addBlockToDB : addBlockToDB,
  getBlockFromDB : getBlockFromDB,
  getBlockHeightFromDB : getBlockHeightFromDB
}
