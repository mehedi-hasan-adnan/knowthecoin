const Transaction = require('./transaction')
const { STARTING_BALANCE } = require('../config')
const { ec, crypto_hash } = require('../utils')

class Wallet {
    constructor () {
        this.balance = STARTING_BALANCE
        this.key_pair = ec.genKeyPair()
        this.public_key = this.key_pair.getPublic().encode('hex')
    }

    sign (data) {
        return this.key_pair.sign(crypto_hash(data))
    }

    create_transaction ({ recipient, amount }) {
        if (amount > this.balance) {
            throw new Error('Amount exceeds balance')
        }
        return new Transaction({ sender_wallet: this, recipient, amount })
    }
}

module.exports = Wallet