const { task } = require("hardhat/config");
// require("@nomicfoundation/hardhat-toolbox");

// const { ethers } = require("hardhat");


require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "ropsten",
  networks: {
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.API_KEY}`,
      accounts: [process.env.PRIV_KEY1, process.env.PRIV_KEY2],
    },
    rinkeby:{
      url: `https://rinkeby.infura.io/v3/${process.env.API_KEY}`,
      accounts: [process.env.PRIV_KEY1, process.env.PRIV_KEY2],
    },
  },
};


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("deploy-contract", "Deploys the contract and prints the address")
.setAction(async () => {
    const Reputation = await hre.ethers.getContractFactory("Reputation");
    const reputation = await Reputation.deploy();
    await reputation.deployed();
    console.log("Contract deployed to: %s", reputation.address)
})

task("read-list", "Reads list of deployed contract")
  .setAction(async (taskArgs) =>
  {
    const [signer] = await hre.ethers.getSigners();
    console.log(signer.address)
    const Reputation = await hre.ethers.getContractFactory("Reputation");
    const reputation = await Reputation.deploy();
    await reputation.deployed();

    console.log( await reputation.getCID());
    
  })

  task("check-provider", "Tells the current provider").setAction(async () => {
    console.log(await ethers.provider.getNetwork());
  })

// task("add-trusted", "Adds the target account to the trusted list.")
//   .addParam("personal-account", "The account owner of the trust-list that will be updated")
//   .addParam("target-account", "The account being added to the trust-list")
//   .setAction(async (taskArgs) => {

//   })
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
