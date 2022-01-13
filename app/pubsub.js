const redis = require("redis")

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
}

class PubSub {
    constructor (blockchain) {
        this.blockchain = blockchain
        this.publisher = redis.createClient()
        this.subscriber = redis.createClient()
        this.subscriber.on("message", (channel, message) => this.handle_message(channel, message))
        this.subscribe_to_channels()
    }
    handle_message (channel, message) {
        console.log(`Message received. Channel : ${channel}, Message: ${message}.`)
        let parsed_message = JSON.parse(message)
        if (channel == CHANNELS.BLOCKCHAIN) {
            this.blockchain.replace_chain(parsed_message)
        }
    }
    subscribe_to_channels () {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel)
        })
    }
    publish ({channel, message}) {
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.subscriber.subscribe(channel)
            })
        })
        
    }
    broadcast_chain () {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        })
    }
}

// const pub_sub = new PubSub()
// setTimeout(() => {
//     pub_sub.publisher.publish(CHANNELS.TEST, "first-message")
// }, 1000)

module.exports = PubSub