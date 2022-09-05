
const {PRE} = require('@futuretense/proxy-reencryption');
const {ethers, network} = require("hardhat");
const {SignerWithAddress} = require("@nomiclabs/hardhat-ethers/signers")


const { curve } = require('@futuretense/curve25519-elliptic');
const { expect } = require('chai');
const { Provider } = require('@ethersproject/abstract-provider');

const tag = Buffer.from('TAG');
const data = Buffer.from('This is uber secret', 'utf-8');

describe.only('re-encrypt', function () {
    it("Should do re-encryption", async () => {


    // Constructs smart contract
    const Reputation = await ethers.getContractFactory("Reputation");
    const reputation = await Reputation.deploy();
    await reputation.deployed();

    // Eth Wallet Creation
    const aliceWallet = await ethers.Wallet.createRandom().connect(ethers.provider);
    await network.provider.send("hardhat_setBalance", [
        aliceWallet.address,
        "0xffffffffffffffffffffffffffff",
    ]);
    
    const bobWallet = await ethers.Wallet.createRandom().connect(ethers.provider);
    await network.provider.send("hardhat_setBalance", [
        bobWallet.address,
        "0xffffffffffffffffffffffffffff",
    ]);
    
    // Get cruve scalar private keys.
    const aliceKeyScalar = curve.scalarFromBuffer(Buffer.from(aliceWallet.privateKey.substring(2), 'hex'));
    const bobKeyScalar = curve.scalarFromBuffer(Buffer.from(bobWallet.privateKey.substring(2), 'hex'));

    // Generate Public Key
    const alicePK = curve.basepoint.mul(aliceKeyScalar).toBuffer();
    const bobPK =  curve.basepoint.mul(bobKeyScalar).toBuffer();

    const bob =  await SignerWithAddress.create(bobWallet);
    const alice =  await SignerWithAddress.create(aliceWallet);

    /* 
    Alice Encrypts Data
    */

    // Load concrete implementation of re-encryption utility.
    const alicePRE = new PRE(aliceKeyScalar.toBuffer(), curve);
    // Run Base Algo of encrypting 
    const selfCipher = await alicePRE.selfEncrypt(data, tag);

    /* 
        Bob connects to request the data from Alice.

    */
    await reputation.connect(bob).makeRequestForTrustRelationsDecryption(aliceWallet.address, bobPK, {
        value: ethers.utils.parseUnits("100", "gwei")
    });
    const lifecycleState = await reputation.connect(bob).getCurrentREKRequestState(aliceWallet.address);
    expect(lifecycleState).to.equal(1)

    /* 
        Alice recieves Bobs request and attempts to retrieve public key to create Re-encryption keys.
    */ 
    const bobsPubKey = await reputation.connect(alice).getPublicKey(bob.address);
    
    bobsPKFromContract = Buffer.from(bobsPubKey.substring(2),'hex')

    const bobREK = alicePRE.generateReKey(bobsPKFromContract, tag);
   
    await reputation.store(bobREK.R1, bobREK.R2, bobREK.R3);

    /*
        Bob takes the data Re-Encryption keys from the contract
    */
    const bytesList = await reputation.retrieve();
    const rekey = {
        R1: Buffer.from(bytesList.r1.substring(2), 'hex'), R2: Buffer.from(bytesList.r2.substring(2), 'hex'), R3: Buffer.from(bytesList.r3.substring(2), 'hex')
    };
  
    const reCipher = PRE.reEncrypt(bobsPKFromContract, selfCipher, rekey, curve);
    const bobPRE = new PRE(bobKeyScalar.toBuffer(), curve);
    const newPlaintext = await bobPRE.reDecrypt(reCipher);

    expect(newPlaintext.toString()).to.equal(data.toString());
    
})
})