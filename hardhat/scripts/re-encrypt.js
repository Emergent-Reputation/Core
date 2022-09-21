const { ethers } = require("hardhat");


fs = require('fs')
const { Readable } = require('stream')
const { CID } = require('multiformats/cid')
const Block = require('multiformats/block')

const { sha256 } = require('multiformats/hashes/sha2')
const dagCBOR = require('@ipld/dag-cbor')
const { curve } = require('@futuretense/curve25519-elliptic');


// CAR utilities, see https://github.com/ipld/js-car for more info
const { CarWriter } = require( '@ipld/car/writer')
const { CarReader } = require( '@ipld/car/reader');
const { PRE } = require("@futuretense/proxy-reencryption");
const {EmergentReputation} = require("../../sdk/emergent-reputation");
const { assert } = require("console");

(async()=>{


  const Reputation = await ethers.getContractFactory("Reputation");
  const reputation = await Reputation.deploy();
  await reputation.deployed();

  console.log(reputation.address);

  const aliceWallet2 = await ethers.Wallet.createRandom().connect(ethers.provider);
  const aliceWallet = new ethers.Wallet(process.env.PRIV_KEY1, ethers.provider)
  await network.provider.send("hardhat_setBalance", [
      aliceWallet.address,
      "0xffffffffffffffffffffffffffff",
  ]);
  const adr = await reputation.connect(aliceWallet).getAddress();
  console.log(aliceWallet.address);
  const ERAdapter = await EmergentReputation.create(process.env.PRIV_KEY1, reputation.address);
  assert(process.env.PRIV_KEY1 == aliceWallet.privateKey)
  console.log(process.env.PRIV_KEY1)
  console.log(aliceWallet.privateKey)
  console.log( await ERAdapter.getAddress());
  const payload = await ERAdapter.encrypt('kartik', 'name');

  const cid =  await EmergentReputation.upload_data(payload)
  console.log(cid)
  const newPayload = await EmergentReputation.read_data(cid)
  console.log( newPayload)
  const plaintext = await ERAdapter.decrypt(newPayload, newPayload.tag);
  console.log(plaintext.toString());

})();
