const SHA256 = require('crypto-js/sha256')
const dataBase = require('./leveldata')

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/
class Block {
  constructor(data){
    this.hash = "",
    this.height = 0,
    this.body = data,
    this.time = 0,
    this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/
class Blockchain {
  constructor() {
    this.getBlockHeight().then((height) => {
      if (height === -1) {
        this.addBlock(new Block("SimpleChain Genesis block")).then(() => console.log("Genesis block added!"))
      }
    })
  }

  async addBlock(newBlock) {
    const height = parseInt(await this.getBlockHeight())

    newBlock.height = height + 1
    newBlock.time = new Date().getTime().toString().slice(0, -3)

    if (newBlock.height > 0) {
      const prevBlock = await this.getBlock(height)
      newBlock.previousBlockHash = prevBlock.hash
    }

    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString()
    await dataBase.addBlockToDB(newBlock.height, JSON.stringify(newBlock))
  }

  async getBlockHeight() {
    return await dataBase.getBlockHeightFromDB()
  }

  async getBlock(blockHeight) {
    return JSON.parse(await dataBase.getBlockFromDB(blockHeight))
  }


  async validateBlock(blockHeight) {
    let block = await this.getBlock(blockHeight);
    let blockHash = block.hash;
    block.hash = '';

    let validBlockHash = SHA256(JSON.stringify(block)).toString();

    if (blockHash === validBlockHash) {
        return true;
      } else {
        console.log(`Block #${blockHeight} invalid hash: ${blockHash} <> ${validBlockHash}`);
        return false;
      }
  }

  async validateChain() {
    let errorLog = []
    let previousHash = ''
    let isValidBlock = false
    let blockHeight = await dataBase.getBlockHeightFromDB()

    for (let i = 0; i <= blockHeight; i++) {
      this.getBlock(i).then((block) => {
        isValidBlock = this.validateBlock(block.height)

        if (!isValidBlock) {
          errorLog.push(i)
        }

        if (block.previousBlockHash !== previousHash) {
          errorLog.push(i)
        }

        previousHash = block.hash

        if (i === (blockHeight -1)) {
          if (errorLog.length > 0) {
            console.log(`Block errors = ${errorLog.length}`)
            console.log(`Blocks: ${errorLog}`)
          } else {
            console.log('No errors detected')
          }
        }
      })
    }
  }
}

let blockchain = new Blockchain();

(function theLoop (i) {
  setTimeout(() => {
    blockchain.addBlock(new Block(`Test data ${i}`)).then(() => {
      if (--i) {
        theLoop(i)
      }
    })
  }, 100);
})(10);

setTimeout(() => blockchain.validateChain(), 2000)
