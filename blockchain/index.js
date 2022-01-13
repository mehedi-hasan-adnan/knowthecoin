const Block = require("./block") 
const { crypto_hash } = require("../utils")

class Blockchain {
    constructor () {
        this.chain = [Block.genesis()]
    }


    add_block ({data}) {
        const new_block = Block.mine_block({
            last_block: this.chain[this.chain.length - 1],
            data
        })

        this.chain.push(new_block)
    }


    replace_chain (chain) {
        if (chain.length <= this.chain.length) {
            return
        }
        if (!Blockchain.is_valid_chain(chain)) {
            return
        }
        console.log("Replacing chain with", chain)
        this.chain = chain
    }


    static is_valid_chain (chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false
        }
        for (let i = 1; i < chain.length; i++) {
            const {timestamp, last_hash, hash, data, nonce, difficulty} = chain[i]
            const actual_last_hash = chain[i - 1].hash
            const last_difficulty = chain[i - 1].difficulty
            if (last_hash !== actual_last_hash) return false
            const validated_hash = crypto_hash(timestamp, last_hash, data, nonce, difficulty)
            if (hash !== validated_hash) return false
            if (Math.abs(last_difficulty - difficulty) > 1) return false
        }
        return true
    }

    
}

module.exports = Blockchain