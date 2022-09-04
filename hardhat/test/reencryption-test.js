
const {PRE} = require('@futuretense/proxy-reencryption');


const { curve } = require('@futuretense/curve25519-elliptic');

const tag = Buffer.from('TAG');
const data = Buffer.from('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff', 'hex');

describe.only('re-encrypt', async () => {
    const w = await ethers.Wallet.createRandom();
    console.log("I fail here.")
    const aliceKey = curve.scalarFromBuffer(Buffer.from("e7a729ed7e312d9b1d6e607796cc782be51b5388ba9ba8094ad7e0677bcc3ff8", 'hex'));

    const bobKey = curve.randomScalar();
    
    const bob = curve.basepoint.mul(bobKey).toBuffer();

    //  `alice` self-encrypts file
    const alicePre = new PRE(aliceKey.toBuffer(), curve);
    const res = await alicePre.selfEncrypt(data, tag);
  
    //  `alice` re-keys the file for `bob`
    const reKey = alicePre.generateReKey(bob, tag);

    //  `proxy` re-encrypts it for `bob`
    const rem = PRE.reEncrypt(bob, res, reKey, curve);

    //  `bob` decrypts it
    const bobPre = new PRE(bobKey.toBuffer(), curve);
    const data2 = await bobPre.reDecrypt(rem);
    console.log(data2)
    // t.true(data.compare(data2) === 0);
});