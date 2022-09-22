const { ethers } = require("hardhat");


const fs = require('fs')
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

/* 
  We can leverag Tags to create trust-relations that you want or don't want exposed.
  We can repeat add L1 Tier Relations to Lower Tiers.
*/

const SecurityLevels = {
  T0: 0,
  T1: 1,
  T2: 2,
  T3: 3,
}

class EmergentReputation {
  static async create(secretKey, contractAddress) {
    return new EmergentReputation(secretKey, await ethers.getContractAt("Reputation", contractAddress));
  }

  constructor(secretKey, contract) {
    this.contract = contract
    this.wallet = new ethers.Wallet(secretKey, ethers.provider)
    this.privateKeyScalar = curve.scalarFromBuffer(Buffer.from(secretKey.substring(2), 'hex'))
    this.pubKey = curve.basepoint.mul(this.privateKeyScalar);
    this.PRECore = new PRE(this.privateKeyScalar.toBuffer(), curve)
  }
  // Try storing data as follows:
  /*
    {
      encrypted: true|false,
      payload: <bytes> -> Only decode if unencrypted, or decrypt and decode.
    }
  */
  static async upload_data(value){
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

  static async read_data(cid){
    if (cid === "") {
      return {out_edges: []}
    }
    const inStream = fs.createReadStream('ipld-local.car')
    const reader = await CarReader.fromIterable(inStream)
    if (typeof cid === 'string'){
      cid = CID.parse(cid)
    }
    const recovered_payload = await reader.get(cid)
    await inStream.close()
  
    return dagCBOR.decode(recovered_payload.bytes)
  }

  getAddress() {
    return this.wallet.address;
  }

  async encrypt(value, tag) {
    return await this.PRECore.selfEncrypt(value, tag);
  }

  async decrypt(value, tag) {
    return await this.PRECore.selfDecrypt(value, tag);
  }
  
  async decrypto(value, tag){}

  async getCID() {
    const connectedContract = await this.contract.connect(this.wallet)
    return await connectedContract.getCID();
  }
  // addTrustRelation adds the [newTrustedAddress] to the adjacency list index by the ownwer node.
  // The securityLevel dictates the minimum level of security access needed to access the list from [T0, T1, T2, T3].
  // T3 being the most secured data, T0 being unencrypted.
  //
  // We utilize a model similar to BLP (Bell–LaPadula model) model constrainted to a view only prespective for re-encrpytion keys.
  async addTrustRelation(newTrustedAddress, securityLevel = SecurityLevels.T0){
    // Retrive data from IPLD or initialize.
    const connectedContract = await this.contract.connect(this.wallet)
    
    const cid = await connectedContract.getCID()
    var payload = {T0: [], T1: [], T2: [], T3: []};
    // const cid = await this.contract.connect(this.Wallet).getCID()
    console.log("Got CID %s", cid)
    if (cid != "") {
      payload = await EmergentReputation.read_data(cid);
    }

    // Add new data to payload.
    switch (securityLevel) {
      case SecurityLevels.T0:
        payload.T0.push(newTrustedAddress);
        // Fall-through
      case SecurityLevels.T1:
        payload.T1.push(await this.encrypt(newTrustedAddress, "T1"));
        // Fall-through
      case SecurityLevels.T2:
        payload.T2.push(await this.encrypt(newTrustedAddress, "T2"));
        // Fall-through
      case SecurityLevels.T3:
        payload.T3.push(await this.encrypt(newTrustedAddress, "T3"));
        break;
      default:
        throw "Security Level passed cannot be understood";
    }

    // Update persistent data stores
    const newCID = await EmergentReputation.upload_data(payload);
    // await this.contract.connect(this.wallet).makeRequestForTrustRelationsDecryption()
    const tx = await connectedContract.updateTrustRelations(newCID.toString());
    await tx.wait()
    return newCID
  }

  async removeTrustRelation() {

  }
  
  async getPublicKey() {
    return this.pubKey;
  }

  async approveRequest(bobAddress) {
    const bobsPubKey = await reputation.connect(this.wallet).getPublicKey(bobAddress);
    const bobsPKFromContract = Buffer.from(bobsPubKey.substring(2),'hex')
    const bobREK = alicePRE.generateReKey(bobsPKFromContract, tag);
    await reputation.connect(alice).postReKey(bob.address, bobREK.R1, bobREK.R2, bobREK.R3);
  }

}

function foo() {
  return 5;
}

module.exports = {
  EmergentReputation,
  SecurityLevels
}
/*
// TODO(@ckartik): Trancompiler - webpack 5 or wheet
  wheat is fast
  esbuild - https://esbuild.github.io/
//!!
*/
