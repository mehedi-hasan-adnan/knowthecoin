const hex_to_binary = require("hex-to-binary")
const {GENESIS_DATA, MINE_RATE} = require('../config')
const { crypto_hash } = require('../utils')

class Block {
    constructor ({timestamp, last_hash, hash, data, nonce, difficulty}) {
        this.timestamp = timestamp
        this.last_hash = last_hash
        this.hash = hash
        this.data = data
        this.nonce = nonce
        this.difficulty = difficulty
    }
    static genesis () {
        const genesis_block = new this(GENESIS_DATA)
        return genesis_block
    }
    static mine_block ({last_block, data}) {
        const last_hash = last_block.hash
        let hash, timestamp
        let {difficulty} = last_block
        let nonce = 0
        do {
            nonce++
            timestamp = Date.now()
            difficulty = Block.adjust_difficulty(last_block, timestamp)
            hash = crypto_hash(timestamp, last_hash, data, nonce, difficulty)
        } while (hex_to_binary(hash).substring(0, difficulty) !== '0'.repeat(difficulty))

        return new this({timestamp, last_hash, data, hash, nonce, difficulty})
    }
    static adjust_difficulty (original_block, timestamp) {
        const {difficulty} = original_block
        if (difficulty < 1) return 1
        if ((timestamp - original_block.timestamp) > MINE_RATE) return difficulty - 1
        return difficulty + 1
    }
}

module.exports = Block