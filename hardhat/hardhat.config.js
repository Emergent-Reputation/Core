const { task } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox");

// const { ethers } = require("hardhat");


require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

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
  .addParam("contractAddress", "Address of contract deployed")
  .setAction(async (taskArgs) =>
  {

    const contract = new hre.ethers.Contract(taskArgs.contractAddress);
    
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
module.exports = {
  solidity: "0.8.4",
};
