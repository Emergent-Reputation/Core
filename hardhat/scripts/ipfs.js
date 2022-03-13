require('dotenv').config()
const public_key = process.env.PUBLIC_KEY;
const secret_key = process.env.PRIVATE_KEY;



const { create }= require('ipfs-http-client');

const Web3 = require("web3")
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/a65b92cc823246529d3bfe3701e8b916"))
web3.eth.accounts.wallet.add(secret_key);

const contract = require("../artifacts/contracts/Reputation.sol/Reputation.json");

const contractAddress = "0xFafcD961d53E66c0c2E4AAd1eE7dc69E9727C19d";
const reputation_contract = new web3.eth.Contract(contract.abi, contractAddress);


function signAddress(public_key_to_sign) {
	return web3.eth.accounts.sign(public_key_to_sign, secret_key);
}

//console.log("sign", signAddress(public_key))

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
	}
	else {
		data = JSON.parse(prev_signatures);
	}
	data.out_signatures.push(signAddress(public_key_to_sign).signature);
	updated_signatures = JSON.stringify(data);
	return updated_signatures;
}

// IPFS is not working yet.
const projectId = 'a65b92cc823246529d3bfe3701e8b916';

const projectSecret = 'fcb6f87ad35a4f189dd5e88840d2810b';

const auth =
    'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

// Using infura.io node for IPFS. Otherwise we run a daemon on our own computer.
const ipfs = create({ host: 'ipfs.infura.io', port: '5001', protocol: 'https'})

async function get_cid(signatures) {
  const { cid } = await ipfs.add(signatures);
  console.log(cid);
}
get_cid(update_out_signatures('', public_key));

/**ipfs.pin.add("vsv", (error, result)=> {
	console.log('IPFS result', result[0].hash);
	if(error) {
		console.error(error);
		return;
	}
})*/

async function update_cid(cid) {
  reputation_contract.methods.updateTrustRelations(cid).send({from:public_key, gas:5000000});
}

async function retrieve_signatures(cid) {
  const stream = ipfs.cat(cid);
  let data = '';

  for await (const chunk of stream) {
  // chunks of data are returned as a Buffer, convert it back to a string
    data += chunk.toString();
  }
  console.log(data);
}
retrieve_signatures("QmaMuUwaS6bqEkgEJeHSvYd4258654qwTixXwQTsi3QPH2");
//console.log(update_cid("hi"));
//content();
