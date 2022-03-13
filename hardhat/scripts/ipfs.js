require('dotenv').config()
const public_key = process.env.PUBLIC_KEY;
const secret_key = process.env.PRIVATE_KEY;
console.log(public_key)
console.log(secret_key)
// const { create } = require('ipfs-http-client');



fs = require('fs')
const { Readable } = require('stream')
// js-multiformats basic pieces for dealing with blocks and CIDs
const { CID } = require('multiformats/cid')
const Block = require('multiformats/block')

// Multihashers
const { sha256 } = require('multiformats/hashes/sha2')
// some other multihashers that may be of interest:
// import { blake2b256 } from '@multiformats/blake2/blake2b'
// import { sha3256 } from '@multiformats/sha3'
// import { sha3512 } from '@multiformats/sha3'
// see https://github.com/multiformats/js-multiformats#multihash-hashers-1

// IPLD codecs
const raw = require('multiformats/codecs/raw')
const dagJSON = require('@ipld/dag-json')
const dagCBOR = require('@ipld/dag-cbor')
// some other codecs that may be of interest:
// import * as json from 'multiformats/codecs/json'
// import * as dagPB from '@ipld/dag-pb'
// import * as dagJOSE from 'dag-jose'
// see https://github.com/multiformats/js-multiformats#ipld-codecs-multicodec

// CAR utilities, see https://github.com/ipld/js-car for more info
const { CarWriter } = require( '@ipld/car/writer')
const { CarReader } = require( '@ipld/car/reader')


const utf8Encoder = new TextEncoder()
const utf8Decoder = new TextDecoder()

const Web3 = require("web3")
// const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/a65b92cc823246529d3bfe3701e8b916"))
const web3 = new Web3()
web3.eth.accounts.wallet.add(secret_key);

function signAddress(data) {
	return web3.eth.accounts.sign(data, secret_key);
}


/*{
        "identity": "0x0000",
        "in_signatures": ["baf0023e1", "baf0023e2", "baf0023e3",  "baf0023e4"], // 0x0000 has their pub key signed by key4.
        "in_pub_keys": ["key1", "key2", "key3", "Key4"],
        "out_signatures": ["baf0023e1", "baf0023e2"]
    }*/
function update_in_signatures(prev_signatures, pk, signature) {
	var data = {};
	if (prev_signatures == '') {
		data.identity = public_key;
        data.in_signatures = [];
        data.in_public_keys = [];
       	data.out_signatures = [];
	}
	else {
		data = JSON.parse(prev_signatures);
	}
	//assert(web3.eth.recover())
	data.in_public_keys.push(pk);
	data.in_signatures.push(signature);
	updated_signatures = JSON.stringify(data);
	return updated_signatures;
}


const account9 = '0xE46584891C56aE45EfB01F56Dd811Ff011638f0a'
/*{
        "identity": "0x0000",
        "in_signatures": ["baf0023e1", "baf0023e2", "baf0023e3"],
        "in_pub_keys": ["key1", "key2", "key3"],
        "out_signatures": ["baf0023e1", "baf0023e2", "baf0023e3"] // 0x0000 signs anothers pub k */
function update_out_signatures(prev_signatures, public_key_to_sign) {
	var data = {};
	if (prev_signatures == '') {
		data.identity = public_key;
        data.in_signatures = [];
        data.in_public_keys = [];
       	data.out_signatures = [];
		data.signature = signAddress(data.out_signatures)
	}
	else {
		data = JSON.parse(prev_signatures);
	}
	data.out_signatures.push(signAddress(public_key_to_sign).signature);
	updated_signatures = JSON.stringify(data);
	return updated_signatures;
}

console.log(update_out_signatures('', account9))

// IPFS is not working yet.
// const projectId = 'a65b92cc823246529d3bfe3701e8b916';

// const projectSecret = 'fcb6f87ad35a4f189dd5e88840d2810b';

// const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

// Using infura.io node for IPFS. Otherwise we run a daemon on our own computer.
// const ipfs = create({ host: 'ipfs.infura.io', port: '5001', protocol: 'https'})

/**ipfs.pin.add("vsv", (error, result)=> {
	console.log('IPFS result', result[0].hash);
	if(error) {
		console.error(error);
		return;
	}
})*/

