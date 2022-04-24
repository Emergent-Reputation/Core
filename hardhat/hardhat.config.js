const { task } = require("hardhat/config");
const { Framework } = require("@superfluid-finance/sdk-core");

require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

var contract;
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("deploy", "Deploys the contracts and prints the Address", async (taskArgs, hre) => {
  const Reputation  = await hre.ethers.getContractFactory("Reputation")
  console.log(Reputation)
  const reputation = await Reputation.deploy()

  contract = reputation
  console.log(reputation.address)
});

task("contract-address", "Gets the contract address", async (taskArgs, hre) => {
  console.log(contract.address);
});

task("super", "print superfluid signer", async (taskArgs, hre) => {
  const sf = await Framework.create({
    networkName: "rinkeby",
    provider: hre.ethers.provider,
  });
  
  
  const signer = sf.createSigner({
    privateKey: "e7a729ed7e312d9b1d6e607796cc782be51b5388ba9ba8094ad7e0677bcc3ff8",
    provider: hre.ethers.provider,
  });
  console.log(sf)
  console.log(await signer.getAddress())
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "rinkeby",
  networks: {
    hardhat: {
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/6c2262857eb848b6a1fad45a8a3f6686",
      accounts: [process.env.PK1, process.env.PK2]
    }
  },
  solidity: "0.8.4",
};
