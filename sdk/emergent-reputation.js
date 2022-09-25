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
const SecurityLevelsToTag = [Buffer.from("T0"), Buffer.from("T1"), Buffer.from("T2"), Buffer.from("T3")]

class EmergentReputation {
  static async create(secretKey, contractAddress) {
    return new EmergentReputation(secretKey, await ethers.getContractAt("Reputation", contractAddress));
  }

  constructor(secretKey, contract) {
    this.contract = contract
    this.wallet = new ethers.Wallet(secretKey, ethers.provider)
    this.privateKeyScalar = curve.scalarFromBuffer(Buffer.from(secretKey.substring(2), 'hex'))
    this.pubKey = curve.basepoint.mul(this.privateKeyScalar).toBuffer();
    this.PRECore = new PRE(this.privateKeyScalar.toBuffer(), curve)
  }
  // Try storing data as follows:
  /*
    {
      encrypted: true|false,
      payload: <bytes> -> Only decode if unencrypted, or decrypt and decode.
    }
  */
 // TODO(@ckartik): Start to store the data on IPFS.
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
  

  async getCID() {
    const connectedContract = await this.contract.connect(this.wallet)
    return await connectedContract.getCID();
  }

  async getCustomers() {
    const connectedContract = await this.contract.connect(this.wallet)

    return await connectedContract.getCustomerList();
  }

  async getPublicKey(customerAddress) {
    const connectedContract = await this.contract.connect(this.wallet)

    return await connectedContract.getPublicKey(customerAddress)
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
    if (cid != "") {
      payload = await EmergentReputation.read_data(cid);
    }
    const data = Buffer.from(newTrustedAddress, 'utf-8')
    // Add new data to payload.
    switch (securityLevel) {
      case SecurityLevels.T0:
        payload.T0.push(data);
        // Fall-through
      case SecurityLevels.T1:
        payload.T1.push(await this.encrypt(data, Buffer.from("T1")));
        // Fall-through
      case SecurityLevels.T2:
        payload.T2.push(await this.encrypt(data,  Buffer.from("T2")));
        // Fall-through
      case SecurityLevels.T3:
        payload.T3.push(await this.encrypt(data,  Buffer.from("T3")));
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

  // getTrustRelations retrives the payload stored in ipld for the owner with address [locksmithAddress]. 
  // The data is retrieved as is from IPLD and returned.
  async getTrustRelations(locksmithAddress) {
    const connectedContract = await this.contract.connect(this.wallet)

    const cid = await connectedContract.getCIDFor(locksmithAddress);
    return await EmergentReputation.read_data(cid)
  }

  // requestDecryption queues a request on chain to ask the locksmith to forge re-ecryption keys for the data in question.
  // returns a reciept of transaction
  async requestDecryption(locksmithAddress, securityLevel) {
    const connectedContract = await this.contract.connect(this.wallet)

    const tx = await connectedContract.makeRequestForTrustRelationsDecryption(locksmithAddress, this.pubKey, ethers.BigNumber.from(securityLevel), {
      value: ethers.utils.parseUnits("1000000", "gwei")
    });

    return await tx.wait();
  }

  // TODO(@ckartik): Implement this
  // removeTrustRelation removes trust relations from a users stored and encrypted data.
  async removeTrustRelation() {

  }
  
  async approveRequest(customerAddress) {
    const connectedContract = await this.contract.connect(this.wallet)

    const customersPubKey = await this.getPublicKey(customerAddress);
    const customersPKFromContract = Buffer.from(customersPubKey.substring(2),'hex')
    const customerREK = this.PRECore.generateReKey(customersPKFromContract, SecurityLevelsToTag[await connectedContract.getRequestedTier(customerAddress)]);
    const tx = await connectedContract.postReKey(customerAddress, customerREK.R1, customerREK.R2, customerREK.R3);
    return await tx.wait()
  }

  async getDecryptedTrustRelation(locksmithAddress, Tier) {
    const connectedContract = await this.contract.connect(this.wallet)

    const keyList = await connectedContract.getReKey(locksmithAddress)
    const rekey = {
      R1: Buffer.from(keyList.r1.substring(2), 'hex'), R2: Buffer.from(keyList.r2.substring(2), 'hex'), R3: Buffer.from(keyList.r3.substring(2), 'hex')
    };

    const relations = await this.getTrustRelations(locksmithAddress)
    const transformedRelations = relations[Tier].map( x => PRE.reEncrypt(this.pubKey, x, rekey, curve)) 
    
    var trustList = []
    for (let i = 0; i < transformedRelations.length; i++) {
      const val = await this.PRECore.reDecrypt(transformedRelations[i]);
      trustList.push(val.toString())
    }

    return trustList
  }

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
