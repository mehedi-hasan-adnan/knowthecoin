const uuid = require('uuid/v1')
const { verify_signature } = require('../utils')

class Transaction {
    constructor ({ sender_wallet, recipient, amount }) {
        this.id = uuid()
        this.output_map = this.create_output_map({ sender_wallet, recipient, amount })
        this.input = this.create_input({ sender_wallet, output_map: this.output_map })
    }

    create_output_map ({ sender_wallet, recipient, amount}) {
        const output_map = {}

        output_map[recipient] = amount
        output_map[sender_wallet.public_key] = sender_wallet.balance - amount

        return output_map
    }

    create_input ({ sender_wallet, output_map}) {
        return {
            timestamp : Date.now(),
            amount : sender_wallet.balance,
            address : sender_wallet.public_key,
            signature : sender_wallet.sign(output_map)
        }
    }

    update ({ sender_wallet, recipient, amount }) {
        if (amount > this.output_map[sender_wallet.public_key]) {
            throw new Error('Amount exceeds balance')
        }

        if (!this.output_map[recipient]) {
            this.output_map[recipient] = amount
        } else {
            this.output_map[recipient] = this.output_map[recipient] + amount
        }

        
        this.output_map[sender_wallet.public_key] = this.output_map[sender_wallet.public_key] - amount

        this.input = this.create_input({ sender_wallet, output_map : this.output_map})
    }

    static valid_transaction ( transaction ) {
        const { input : { address, amount, signature}, output_map } = transaction
        const output_total = Object.values(output_map).reduce((total, output_amount) => total + output_amount)

        if (amount !== output_total) {
            console.error(`Invalid transaction from ${address}`)
            return false
        }
        if (!verify_signature({ public_key: address, data: output_map, signature })) {
            console.error(`Invalid signature from ${address}`)
            return false
        }
        return true
    }
}

module.exports = Transaction