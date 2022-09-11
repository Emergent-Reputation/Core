const { ethers } = require("hardhat");



class EmergentReputation {
  static async create(secretKey, contractAddress) {
    return new EmergentReputation(secretKey, await ethers.getContractAt("Reputation", contractAddress));
  }
  
  // Try storing data as follows:
  /*
    {
      encrypted: true|false,
      payload: <bytes> -> Only decode if unencrypted, or decrypt and decode.
    }
  */
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
  
  constructor(secretKey, contract) {
      this.contract = contract
      this.wallet = new ethers.Wallet(secretKey, ethers.provider)
  }

  async getAddress() {
    return await this.contract.connect(this.wallet).getAddress();
  }

  async addTrustRelation() {
    const cid = await contract.connect(this.Wallet).getCID()
    if (cid === ""){
      payload = {out_edges: []}
    } else {
      payload = await EmergentReputation.read_data(cid)
    }
    // What to do with the payload -> Likely want to alter and post.
  }

  async removeTrustRelation() {

  }
  
  async 
}


(async()=>{

const Reputation = await ethers.getContractFactory("Reputation");
const reputation = await Reputation.deploy();
await reputation.deployed();

console.log(reputation.address);

const aliceWallet = await ethers.Wallet.createRandom().connect(ethers.provider);
await network.provider.send("hardhat_setBalance", [
    aliceWallet.address,
    "0xffffffffffffffffffffffffffff",
]);
const adr = await reputation.connect(aliceWallet).getAddress();
console.log(aliceWallet.address);
const ERAdapter = await EmergentReputation.create(aliceWallet.privateKey, reputation.address);

console.log( await ERAdapter.getAddress());

})();