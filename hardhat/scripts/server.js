const { ethers } = require("hardhat");
const { create } = require('ipfs-http-client');
const Web3 = require("web3")
const web3 = new Web3()


fs = require('fs')
const { Readable } = require('stream')
const { CID } = require('multiformats/cid')
const Block = require('multiformats/block')

const { sha256 } = require('multiformats/hashes/sha2')
const dagCBOR = require('@ipld/dag-cbor')


// CAR utilities, see https://github.com/ipld/js-car for more info
const { CarWriter } = require( '@ipld/car/writer')
const { CarReader } = require( '@ipld/car/reader')


const utf8Encoder = new TextEncoder()
const utf8Decoder = new TextDecoder()

async function upload_data(value){
	const payload = await Block.encode({
		value: value,
		hasher: sha256,
		codec: dagCBOR
	})

	console.log(payload.cid)

	const { writer, out } = await CarWriter.create([payload.cid])
	Readable.from(out).pipe(fs.createWriteStream('ipld-local.car'))

	writer.put(payload)

	await writer.close()

	return payload.cid
}

async function read_data(cid){
	const inStream = fs.createReadStream('ipld-local.car')
	const reader = await CarReader.fromIterable(inStream)

	const recovered_payload = await reader.get(cid)

	console.log(dagCBOR.decode(recovered_payload.bytes))

	return dagCBOR.decode(recovered_payload.bytes)
}

upload_data({
	out_edges: []
}).then((cid) => read_data(cid))

function local_deploy() {
	const reputation =  ethers.getContractFactory("Reputation").then((Rep) =>  Rep.deploy())
	// console.log("CONTRACT FACTORYY: %s", Reputation)
    // const reputation = await Reputation.deploy();
	console.log("CONTRACT DEPLOYED: %s", reputation)

    // await reputation.deployed();

	const accounts = ethers.getSigners();
	console.log("I GET HREE")

	return {"rep": reputation, "acc": accounts}
}

let obj = local_deploy()
reputation = obj.rep
accounts = obj.acc


async function update_trusted_list(account, newTrustedAccount) {
	const contract = await reputation
	const cid = await contract.connect(account).getCID()
	if (cid === ""){
		payload = {out_edges: []}
	} else {
		payload = await read_data(cid)
	}
	payload.out_edges.push(newTrustedAccount.address)

	newCID = upload_data(payload)

	contract.connect(account).updateTrustRelations(newCID)
}


const express = require('express')
const app = express()



// function signAddress(public_key_to_sign) {
// 	return web3.eth.accounts.sign(public_key_to_sign, secret_key);
// }


// function signAddress(public_key_to_sign) {
// 	return web3.eth.accounts.sign(public_key_to_sign, secret_key);
// }

// /*{
//         "identity": "0x0000",
//         "in_signatures": ["baf0023e1", "baf0023e2", "baf0023e3",  "baf0023e4"], // 0x0000 has their pub key signed by key4.
//         "in_pub_keys": ["key1", "key2", "key3", "Key4"],
//         "out_pub_keys" ["k1", "k2"],
//         "out_signatures": ["baf0023e1", "baf0023e2"]
//     }*/
// function update_in_signatures(prev_signatures, pk, signature) {
// 	var data = {};
// 	if (prev_signatures == '') {
// 		data.identity = public_key;
//         data.in_signatures = [];
//         data.in_public_keys = [];
//         data.out_public_keys = [];
//        	data.out_signatures = [];
// 	}
// 	else {
// 		data = JSON.parse(prev_signatures);
// 	}
// 	//assert(web3.eth.recover())
// 	data.in_public_keys.push(pk);
// 	data.in_signatures.push(signature);
// 	updated_signatures = JSON.stringify(data);
// 	return updated_signatures;
// }

// /*{
//         "identity": "0x0000",
//         "in_signatures": ["baf0023e1", "baf0023e2", "baf0023e3"],
//         "in_pub_keys": ["key1", "key2", "key3"],
//         "out_pub_keys" ["k1", "k2"],
//         "out_signatures": ["baf0023e1", "baf0023e2", "baf0023e3"] // 0x0000 signs anothers pub k */
// function update_out_signatures(prev_signatures, public_key_to_sign) {
// 	var data = {};
// 	if (prev_signatures == '') {
// 		data.identity = public_key;
//         data.in_signatures = [];
//         data.in_public_keys = [];
//         data.out_public_keys = [];
//        	data.out_signatures = [];
// 	}
// 	else {
// 		data = JSON.parse(prev_signatures);
// 	}
// 	data.out_public_keys.push(public_key_to_sign);
// 	data.out_signatures.push(signAddress(public_key_to_sign).signature);
// 	updated_signatures = JSON.stringify(data);
// 	return updated_signatures;
// }

// // Using infura.io node for IPFS. Otherwise we run a daemon on our own computer.
// const ipfs = create({ host: 'ipfs.infura.io', port: '5001', protocol: 'https'})

// //Store data on IPFS.
// async function get_cid(signatures) {
//   const { cid } = await ipfs.add(signatures);
//   console.log(cid);
// }
// // get_cid(update_out_signatures('', public_key));

// //Update the cid of an address.
// async function update_cid(cid) {
//   reputation_contract.methods.updateTrustRelations(cid).send({from:public_key, gas:6000000});
// }

// //update_cid("QmdEmNGcqjMHoMzDrPriwaqCe8YbVAbf75pS5j25G8hiJE");

// //Retrive data from IPFS.
// async function retrieve_signatures(cid) {
//   const stream = ipfs.cat(cid);
//   let data = '';

//   for await (const chunk of stream) {
//   // chunks of data are returned as a Buffer, convert it back to a string
//     data += chunk.toString();
//   }
//   console.log(data);
//   data = JSON.parse(data);
//   return data
// }

// //Get out_public_keys for ANY public address.
// async function get_out_public_keys(pk) {
//   const cid = reputation_contract.methods.getCIDFor(pk).call({from:public_key, gas:5000000});
//   data = retrieve_signatures(cid);
//   //console.log("rectrieved cid", cid);
//   return data.out_public_keys;	
// }

// retrieve_signatures("QmdEmNGcqjMHoMzDrPriwaqCe8YbVAbf75pS5j25G8hiJE");
//Check if two addresses are connected within a certain distance.
// function find_connection(pk, distance) {
//   const queue = [[public_key,0]];
//   const result = [];
//   const visited = {};
//   visited[public_key] = true;
//   let currentVertex;
//   let level;
//   while (queue.length) {
//     next = queue.shift();
//     currentVertex = next[0];
//     level = next[1];
//     result.push(currentVertex);var keys = get_out_public_keys(currentVertex);
//     var keys = get_keys(currentVertex);
//     for(var i = 0; i < keys.length; i++) {
//       if (keys[i] == pk && level + 1 <= distance) {
//       	return true;
//       }
//       if (!visited[keys[i]]) {
//       	if (level + 1 > distance) {
//       	  return false;
//       	}
//         visited[keys[i]] = true;
//         queue.push([keys[i], level+1]);
//       }
//     };
//   }
//   return false;
// }

// retrieve_signatures("QmaMuUwaS6bqEkgEJeHSvYd4258654qwTixXwQTsi3QPH2");
//console.log(update_cid("hi"));
//content();

// GET ACCOUNTS

// 


console.log("HERE LOOK AT MEEEEE: %s", reputation)
app.get('/', (req, res) => {
	retrieve_signatures("QmaMuUwaS6bqEkgEJeHSvYd4258654qwTixXwQTsi3QPH2").then((data) =>
	res.send(data.toString())
	)
})

app.get('/contract', (req, res) => {
	reputation.then((contract) => 	{
		accounts.then(
			(accounts) =>  contract.getCIDFor(accounts[0].address).then((resp) => res.send(resp))
		)
	}
	)
})

app.get('/contract-add-cid/:cid', (req, res) => {
	const cid = req.params.cid
	reputation.then((contract) => 	{
		accounts.then(
			(accounts) =>  contract.connect(accounts[0]).updateTrustRelations(cid.toString()).then(contract.getCID().then((resp)=> res.send(resp)))
		)
	}
	)
})

app.get('/accounts', (req, res) => {
	accounts.then(
		(accounts) => res.send(accounts[0].address)
	)
})

app.listen(3000)
