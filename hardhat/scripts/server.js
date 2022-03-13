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

	const { writer, out } = await CarWriter.create([payload.cid])
	Readable.from(out).pipe(fs.createWriteStream('ipld-local.car'))

	writer.put(payload)

	await writer.close()

	return payload.cid
}

async function read_data(cid){
	if (cid === "") {
		return {out_edges: []}
	}
	const inStream = fs.createReadStream('ipld-local.car')
	const reader = await CarReader.fromIterable(inStream)

	const recovered_payload = await reader.get(cid)


	return dagCBOR.decode(recovered_payload.bytes)
}

upload_data({
	out_edges: []
}).then((cid) => read_data(cid))

function local_deploy() {
	const reputation =  ethers.getContractFactory("Reputation").then((Rep) =>  Rep.deploy())

	const accounts = ethers.getSigners();

	return {"rep": reputation, "acc": accounts}
}


async function update_trusted_list(account, newTrustedAccount) {
	const contract = await reputation
	const cid = await contract.connect(account).getCID()
	if (cid === ""){
		payload = {out_edges: []}
	} else {
		payload = await read_data(cid)
	}
	payload.out_edges.push(newTrustedAccount.address)
	newCID = await upload_data(payload)

	await contract.connect(account).updateTrustRelations(newCID)

	return newCID
}


const express = require('express')
const app = express()
app.use(express.json())


let obj = local_deploy()
let reputation = obj.rep
let eth_accounts = obj.acc

// 
app.get('/accounts', (req, res) => {
	eth_accounts.then((accounts) => res.send(accounts.slice(10).map((v,idx) => Object({ref_id: idx, address: v.address}))))
})

app.get('/accounts/trust-relations', async (req, res) => {
	const accounts = await eth_accounts
	const contract = await reputation
	const cid = await contract.connect(accounts[req.body.ref_id]).getCID()
	const payload = await read_data(cid)
	res.send(payload)
	// accounts.then((accounts) => 
	// 	reputation.then((contract) => {
	// 		res.send(await read_data(await contract.connect(accounts[refID]).getCID()))
	// 	}
	// ))
})

app.post('/accounts/trust-relations', async (req, res) => {
	const accounts = await eth_accounts
	const contract = await reputation
	const newCID = await update_trusted_list(accounts[req.body.ref_id], accounts[req.body.account_to_add])
	const newPayload = await read_data(newCID)
	res.send(Object({
		new_cid: newCID,
		payload: newPayload
	}))
})

app.get('/', (req, res) => {
	res.send("Hello World!")
})

app.get('/contract', (req, res) => {
	reputation.then((contract) => 	{
		eth_accounts.then(
			(accounts) =>  contract.getCIDFor(accounts[0].address).then((resp) => res.send(resp))
		)
	}
	)
})

app.get('/contract-add-cid/:cid', (req, res) => {
	const cid = req.params.cid
	reputation.then((contract) => 	{
		eth_accounts.then(
			(accounts) =>  contract.connect(accounts[0]).updateTrustRelations(cid.toString()).then(contract.getCID().then((resp)=> res.send(resp)))
		)
	}
	)
})

app.get('/accounts', (req, res) => {
	eth_accounts.then(
		(accounts) => res.send(accounts[0].address)
	)
})

app.listen(3000)
