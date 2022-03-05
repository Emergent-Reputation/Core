const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reputation Test", function () {
  it("Should return the string mapped to requesting account.", async function () {
    const Reputation = await ethers.getContractFactory("Reputation");
    const reputation = await Reputation.deploy();
    await reputation.deployed();

    await reputation.updateTrustRelations("test");
    expect(await reputation.getCID()).to.equal("test");
  });
});

// TODO: Add test for multiple accounts in map.