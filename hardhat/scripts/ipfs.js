require('dotenv').config()
const public_key = process.env.PUBLIC_KEY;
const secret_key = process.env.PRIVATE_KEY;


const { create }= require('ipfs-http-client');

const Web3 = require("web3")
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/a65b92cc823246529d3bfe3701e8b916"))
web3.eth.accounts.wallet.add(secret_key);

const contract = require("../artifacts/contracts/Reputation.sol/Reputation.json");

const contractAddress = "0xEf25013F949d29d6d4Cdc623B6f7c9e638AF74E0";
const reputation_contract = new web3.eth.Contract(contract.abi, contractAddress);


function signAddress(public_key_to_sign) {
	return web3.eth.accounts.sign(public_key_to_sign, secret_key);
}

//console.log("sign", signAddress(public_key))


/*{
        "identity": "0x0000",
        "in_signatures": ["baf0023e1", "baf0023e2", "baf0023e3",  "baf0023e4"], // 0x0000 has their pub key signed by key4.
        "in_pub_keys": ["key1", "key2", "key3", "Key4"],
        "out_pub_keys" ["k1", "k2"],
        "out_signatures": ["baf0023e1", "baf0023e2"]
    }*/
function update_in_signatures(prev_signatures, pk, signature) {
	var data = {};
	if (prev_signatures == '') {
		data.identity = public_key;
        data.in_signatures = [];
        data.in_public_keys = [];
        data.out_public_keys = [];
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
        "out_pub_keys" ["k1", "k2"],
        "out_signatures": ["baf0023e1", "baf0023e2", "baf0023e3"] // 0x0000 signs anothers pub k */
function update_out_signatures(prev_signatures, public_key_to_sign) {
	var data = {};
	if (prev_signatures == '') {
		data.identity = public_key;
        data.in_signatures = [];
        data.in_public_keys = [];
        data.out_public_keys = [];
       	data.out_signatures = [];
	}
	else {
		data = JSON.parse(prev_signatures);
	}
	data.out_public_keys.push(public_key_to_sign);
	data.out_signatures.push(signAddress(public_key_to_sign).signature);
	updated_signatures = JSON.stringify(data);
	return updated_signatures;
}

// Using infura.io node for IPFS. Otherwise we run a daemon on our own computer.
const ipfs = create({ host: 'ipfs.infura.io', port: '5001', protocol: 'https'})

//Store data on IPFS.
async function get_cid(signatures) {
  const { cid } = await ipfs.add(signatures);
  console.log(cid);
}
get_cid(update_out_signatures('', public_key));

//Update the cid of an address.
async function update_cid(cid) {
  reputation_contract.methods.updateTrustRelations(cid).send({from:public_key, gas:6000000});
}

//update_cid("QmdEmNGcqjMHoMzDrPriwaqCe8YbVAbf75pS5j25G8hiJE");

//Retrive data from IPFS.
async function retrieve_signatures(cid) {
  const stream = ipfs.cat(cid);
  let data = '';

  for await (const chunk of stream) {
  // chunks of data are returned as a Buffer, convert it back to a string
    data += chunk.toString();
  }
  console.log(data);
  data = JSON.parse(data);
  return data
}

//Get out_public_keys for ANY public address.
async function get_out_public_keys(pk) {
  const cid = reputation_contract.methods.getCIDFor(pk).call({from:public_key, gas:5000000});
  data = retrieve_signatures(cid);
  //console.log("rectrieved cid", cid);
  return data.out_public_keys;	
}

retrieve_signatures("QmdEmNGcqjMHoMzDrPriwaqCe8YbVAbf75pS5j25G8hiJE");
//Check if two addresses are connected within a certain distance.
function find_connection(pk, distance) {
  const queue = [[public_key,0]];
  const result = [];
  const visited = {};
  visited[public_key] = true;
  let currentVertex;
  let level;
  while (queue.length) {
    next = queue.shift();
    currentVertex = next[0];
    level = next[1];
    result.push(currentVertex);var keys = get_out_public_keys(currentVertex);
    var keys = get_keys(currentVertex);
    for(var i = 0; i < keys.length; i++) {
      if (keys[i] == pk && level + 1 <= distance) {
      	return true;
      }
      if (!visited[keys[i]]) {
      	if (level + 1 > distance) {
      	  return false;
      	}
        visited[keys[i]] = true;
        queue.push([keys[i], level+1]);
      }
    };
  }
  return false;
}



