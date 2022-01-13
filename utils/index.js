const EC = require('elliptic').ec
const crypto_hash = require('./crypto_hash')

const ec = new EC('secp265k1')

const verify_signature = ({public_key, data, signature}) => {
    const key_from_public = ec.keyFromPublic(public_key, 'hex')
    return key_from_public.verify(crypto_hash(data), signature)
}

module.exports = { ec, verify_signature, crypto_hash }