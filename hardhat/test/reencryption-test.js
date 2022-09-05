
const {PRE, ReKey} = require('@futuretense/proxy-reencryption');
const { ethers } = require("hardhat");


const { curve } = require('@futuretense/curve25519-elliptic');
const { expect } = require('chai');

const tag = Buffer.from('TAG');
const data = Buffer.from('This is uber secret', 'utf-8');

describe.only('re-encrypt', function () {
    it("Should do re-encryption", async () => {
    
    // Constructs smart contract
    const Reputation = await ethers.getContractFactory("Reputation");
    const reputation = await Reputation.deploy();
    await reputation.deployed();

    // Eth Wallet Creation
    const aliceWallet = await ethers.Wallet.createRandom();
    const bobWallet = await ethers.Wallet.createRandom();

    // Get cruve scalar private keys.
    const aliceKeyScalar = curve.scalarFromBuffer(Buffer.from(aliceWallet.privateKey.substring(2), 'hex'));
    const bobKeyScalar = curve.scalarFromBuffer(Buffer.from(bobWallet.privateKey.substring(2), 'hex'));

    // Generate Public Key
    const alicePK = curve.basepoint.mul(aliceKeyScalar).toBuffer();
    const bobPK =  curve.basepoint.mul(bobKeyScalar).toBuffer();

    // Load concrete implementation of re-encryption utility.
    const alicePRE = new PRE(aliceKeyScalar.toBuffer(), curve);

    // Run Base Algo of encrypting 
    const selfCipher = await alicePRE.selfEncrypt(data, tag);

    const bobREK = alicePRE.generateReKey(bobPK, tag);
   
    await reputation.store(bobREK.R1, bobREK.R2, bobREK.R3);

    const bytesList = await reputation.retrieve();
    const key = {
        R1: Buffer.from(bytesList.r1.substring(2), 'hex'), R2: Buffer.from(bytesList.r2.substring(2), 'hex'), R3: Buffer.from(bytesList.r3.substring(2), 'hex')
    };
    console.log(key);
    // console.log(bytesList);

    const reCipher = PRE.reEncrypt(bobPK, selfCipher, key, curve);

    const bobPRE = new PRE(bobKeyScalar.toBuffer(), curve);
    const newPlaintext = await bobPRE.reDecrypt(reCipher);

    
    expect(newPlaintext.toString()).to.equal(data.toString());
    // console.log(Buffer.from(w.privateKey.substring(2), 'hex'));
    // console.log("I fail here.")
    // const aliceKey = curve.scalarFromBuffer(Buffer.from("e7a729ed7e312d9b1d6e607796cc782be51b5388ba9ba8094ad7e0677bcc3ff8", 'hex'));

    // const bobKey = curve.randomScalar();
    
    // const bob = curve.basepoint.mul(bobKey).toBuffer();

    // //  `alice` self-encrypts file
    // const alicePre = new PRE(aliceKey.toBuffer(), curve);
    // const res = await alicePre.selfEncrypt(data, tag);
  
    // //  `alice` re-keys the file for `bob`
    // const reKey = alicePre.generateReKey(bob, tag);

    // //  `proxy` re-encrypts it for `bob`
    // const rem = PRE.reEncrypt(bob, res, reKey, curve);

    // //  `bob` decrypts it
    // const bobPre = new PRE(bobKey.toBuffer(), curve);
    // const data2 = await bobPre.reDecrypt(rem);
    // console.log(data2)
    // t.true(data.compare(data2) === 0);
})
})