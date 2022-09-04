const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Testing the REK creation", function () {
  it("Should map to correct address based string.", async function () {
    const Reputation = await ethers.getContractFactory("Reputation");
    const reputation = await Reputation.deploy();
    await reputation.deployed();

    await reputation.postREK("0xc3bc246D6B0094C8B7D054f911F2bE3b07cE8A63");
  })
})

describe("Basic Deployment & Functionality", function () {
  it("Should return the string mapped to requesting account.", async function () {
    const Reputation = await ethers.getContractFactory("Reputation");
    const reputation = await Reputation.deploy();
    await reputation.deployed();
    expect(await reputation.getCID()).to.equal("");

    await reputation.updateTrustRelations("test");
    expect(await reputation.getCID()).to.equal("test");

    await reputation.removeTrustRelations();
    expect(await reputation.getCID()).to.equal("");
  });

  it("Should coordinate reputation across addr1 and addr2", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Reputation = await ethers.getContractFactory("Reputation");
    const reputation = await Reputation.deploy();
    await reputation.deployed();
    await reputation.updateTrustRelations("trust_1");
    await reputation.connect(addr2).updateTrustRelations("trust_2")
    await reputation.connect(addr1).updateTrustRelations("QmTtB3qim1toPimVCzdb1DahLZaEmRw7MTaEkVj2tDyjza")
    expect(await reputation.getCIDFor(owner.address)).to.equal("trust_1");
    expect(await reputation.connect(addr1).getCIDFor(addr1.address)).to.equal("QmTtB3qim1toPimVCzdb1DahLZaEmRw7MTaEkVj2tDyjza");
    expect(await reputation.connect(addr2).getCIDFor(addr2.address)).to.equal("trust_2");
    

  })

  it("Should delete addr1 in mapping when requested", async function () {
    const Reputation = await ethers.getContractFactory("Reputation");
    const reputation = await Reputation.deploy();
    await reputation.deployed();

  })
});

// TODO: Add test for multiple accounts in map.