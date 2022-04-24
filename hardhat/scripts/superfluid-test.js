const { Framework } = require("@superfluid-finance/sdk-core");
const { ethers } = require("hardhat");

var signer;
var sf;
async function init() {
  console.log("hi")
  sf = await Framework.create({
    networkName: "rinkeby",
    provider: ethers.provider,
  });
  console.log("hi")

  
  signer = sf.createSigner({
    privateKey: "e7a729ed7e312d9b1d6e607796cc782be51b5388ba9ba8094ad7e0677bcc3ff8",
    provider: ethers.provider,
  });

  console.log(await signer.getAddress())
}

Promise.all(
  [init()],
  process.exit(0)
)