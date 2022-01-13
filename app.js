const express = require("express")
const request = require("request")
const bodyParser = require("body-parser")
const Blockchain = require("./blockchain")
const PubSub = require("./app/pubsub")

const app = express()
const blockchain = new Blockchain()
const pubsub = new PubSub(blockchain)
const DEFAULT_PORT = 3000
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

app.use(bodyParser.json())

app.get("/api/blocks", (req, res) => {
    res.json(blockchain.chain)
})

app.post("/api/mine", (req, res) => {
    const {data} = req.body
    blockchain.add_block(data)
    pubsub.broadcast_chain()
    res.redirect("/api/blocks")
})

const sync_chains = () => {
    request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const root_chain = JSON.parse(body)
            blockchain.replace_chain(root_chain)
        }
    })
}

let PEER_PORT

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000)
}

const PORT = PEER_PORT || DEFAULT_PORT

app.listen(PORT, () => {
    console.log(`server listening on port:${PORT}`)
    if (PORT !== DEFAULT_PORT) {
        sync_chains()
    }
})
