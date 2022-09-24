
const {PRE} = require('@futuretense/proxy-reencryption');
const {ethers, network} = require("hardhat");
const {SignerWithAddress} = require("@nomiclabs/hardhat-ethers/signers")
const {BigNumber} = require("@ethersproject/bignumber")

const { curve } = require('@futuretense/curve25519-elliptic');
const { expect } = require('chai');
const { Provider } = require('@ethersproject/abstract-provider');
const {EmergentReputation, SecurityLevels} = require("../../sdk/emergent-reputation");


const tag = Buffer.from('TAG');
const data = Buffer.from('This is uber secret', 'utf-8');


const LifeCycleEnum = {
    UNSET_OR_CLEARED: 0,
    REQUESTED: 1,
    RESPONDED: 2
}
const localRun = true
const deployNew = true

var contractAddress = "0x37de4E8469d00fED7b2006dfDAEbDDC0f205DBc6"

describe.only('re-encrypt', function () {
    it.only("Testing using npm module", async () => {
        if (deployNew) {
            const Reputation = await ethers.getContractFactory("Reputation");
            const reputationDeployed = await Reputation.deploy();
            console.log("Deploying contract...")
            await reputationDeployed.deployed();
            console.log("Contract deployed at %s", reputationDeployed.address)
            contractAddress = reputationDeployed.address
        }
        
        // Create adapters for Alice and Bob
        const ERAdapterLocksmith = await EmergentReputation.create(process.env.PRIV_KEY1, contractAddress)
        const ERAdapterCustomer = await EmergentReputation.create(process.env.PRIV_KEY2, contractAddress)
        if (localRun) {
            await network.provider.send("hardhat_setBalance", [
                ERAdapterLocksmith.getAddress(),
                "0xffffffffffffffffffffffffffff",
            ]);
            await network.provider.send("hardhat_setBalance", [
                ERAdapterCustomer.getAddress(),
                "0xffffffffffffffffffffffffffff",
            ]);
        }

        const newCID = await ERAdapterLocksmith.addTrustRelation(await ERAdapterCustomer.getAddress(), SecurityLevels.T0)
        const newCID2 = await ERAdapterLocksmith.addTrustRelation(await ERAdapterCustomer.getAddress(), SecurityLevels.T0)

        const cidOnNetwork = await ERAdapterLocksmith.getCID()
        expect(newCID2.toString()).to.equal(cidOnNetwork);

        const payload = await ERAdapterCustomer.getTrustRelations(ERAdapterLocksmith.getAddress())
        expect(payload.T0[0]).to.equal(ERAdapterCustomer.getAddress());

        const reciept = await ERAdapterCustomer.requestDecryption(ERAdapterLocksmith.getAddress(), SecurityLevels.T1.toString())
        expect(reciept.events[0].args.newState).to.equal(LifeCycleEnum.REQUESTED);
        expect(reciept.events[0].args.customer).to.equal(ERAdapterCustomer.getAddress().toString());
        expect(reciept.events[0].args.locksmith).to.equal(ERAdapterLocksmith.getAddress().toString());

        const customersList =  await ERAdapterLocksmith.getCustomers();
        expect(customersList[0]).to.equal(ERAdapterCustomer.getAddress());

    })
    it("Should do re-encryption with real accounts", async () => {
        // Constructs smart contract
        if (deployNew) {
            const Reputation = await ethers.getContractFactory("Reputation");
            const reputationDeployed = await Reputation.deploy();
            console.log("Deploying contract...")
            await reputationDeployed.deployed();
            console.log("Contract deployed at %s", reputationDeployed.address)
            contractAddress = reputationDeployed.address
        }
        

        const reputation = await ethers.getContractAt("Reputation", contractAddress)

        // Eth Wallet Creation
        const aliceWallet = await (new ethers.Wallet(process.env.PRIV_KEY1)).connect(ethers.provider);
        const bobWallet = await (new ethers.Wallet(process.env.PRIV_KEY2)).connect(ethers.provider);

        if (localRun) {
            await network.provider.send("hardhat_setBalance", [
                aliceWallet.address,
                "0xffffffffffffffffffffffffffff",
            ]);
            await network.provider.send("hardhat_setBalance", [
                bobWallet.address,
                "0xffffffffffffffffffffffffffff",
            ]);
        }
        
        // Get cruve scalar private keys.
        const aliceKeyScalar = curve.scalarFromBuffer(Buffer.from(aliceWallet.privateKey.substring(2), 'hex'));
        const bobKeyScalar = curve.scalarFromBuffer(Buffer.from(bobWallet.privateKey.substring(2), 'hex'));
    
        // Generate Public Key
        const alicePK = curve.basepoint.mul(aliceKeyScalar).toBuffer();
        const bobPK =  curve.basepoint.mul(bobKeyScalar).toBuffer();
        
        // Set up signers
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
            Bob connects to request the data from Alice and pays dues.
        */
        const requestFromBob = await reputation.connect(bob).makeRequestForTrustRelationsDecryption(aliceWallet.address, bobPK, ethers.BigNumber.from("1"), {
            value: ethers.utils.parseUnits("1000000", "gwei")
        });
        const requestFromBobReciept = await requestFromBob.wait()
        expect(requestFromBobReciept.events[0].args.newState).to.equal(LifeCycleEnum.REQUESTED);
        expect(requestFromBobReciept.events[0].args.customer).to.equal(bob.address.toString());
        expect(requestFromBobReciept.events[0].args.locksmith).to.equal(alice.address.toString());

        /*
            Check lifecycle getter TODO(@ckartik): May want to remove this as redundant
        */
        const lifecycleState = await reputation.connect(bob).getCurrentREKRequestState(aliceWallet.address);
        expect(lifecycleState).to.equal(LifeCycleEnum.REQUESTED)
    
        /* 
            Alice recieves Bobs request and attempts to retrieve public key to create Re-encryption keys.
        */ 
        const bobsPubKey = await reputation.connect(alice).getPublicKey(bob.address);
        const bobsPKFromContract = Buffer.from(bobsPubKey.substring(2),'hex')
        const bobREK = alicePRE.generateReKey(bobsPKFromContract, tag);
        const reKeyPostedTxn = await reputation.connect(alice).postReKey(bob.address, bobREK.R1, bobREK.R2, bobREK.R3);
        
        const reKeyPostedTxnReciept = await reKeyPostedTxn.wait();
        expect(reKeyPostedTxnReciept.events[0].args.newState).to.equal(LifeCycleEnum.RESPONDED);
        expect(reKeyPostedTxnReciept.events[0].args.customer).to.equal(bob.address.toString());
        expect(reKeyPostedTxnReciept.events[0].args.locksmith).to.equal(alice.address.toString());
        /*
            Bob takes the data Re-Encryption keys from the contract
        */
        const bytesList = await reputation.connect(bob).getReKey(alice.address);
        const rekey = {
            R1: Buffer.from(bytesList.r1.substring(2), 'hex'), R2: Buffer.from(bytesList.r2.substring(2), 'hex'), R3: Buffer.from(bytesList.r3.substring(2), 'hex')
        };
      
        const b1 = await alice.getBalance();

        /* 
            Alice closes out funds.
        */
        const fundsCleared = await reputation.connect(alice).clearFunds(bob.address);
        const fundsClearedReciept = await fundsCleared.wait();
        expect(fundsClearedReciept.events[0].args.newState).to.equal(LifeCycleEnum.UNSET_OR_CLEARED);
        expect(fundsClearedReciept.events[0].args.customer).to.equal(bob.address.toString());
        expect(fundsClearedReciept.events[0].args.locksmith).to.equal(alice.address.toString());


        /*
            Testing to make sure funds are being cleared properly
        */
        const b2 = await alice.getBalance();
        const aliceIncome = b2.sub(b1);
        const rewardMax = ethers.utils.parseUnits("1000000", "gwei");
        const rewardsFloor = ethers.utils.parseUnits("900000", "gwei");
      
        // Check that income/reward fits in boundry.
        expect(aliceIncome.lte(rewardMax) && aliceIncome.gte(rewardsFloor)).to.equal(true);

        /* 
            Of-Chain Decryption of data
            TODO(@ckartik): Convert this to be using IPFS style data source with a CID.
        */
        const reCipher = PRE.reEncrypt(bobsPKFromContract, selfCipher, rekey, curve);
        const bobPRE = new PRE(bobKeyScalar.toBuffer(), curve);
        const newPlaintext = await bobPRE.reDecrypt(reCipher);
    
        expect(newPlaintext.toString()).to.equal(data.toString());
        
    })
})
