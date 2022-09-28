const express = require('express')
var cors = require('cors');

const app = express()
const { encode, decode } =  require('@ipld/dag-cbor')


const  {EmergentReputation, SecurityLevels} = require('../../../sdk/emergent-reputation');

// NOTE: This contract address needs to contains CIDs that exist in an accessible IPFS/IPLD
const contractAddress = "0x59b670e9fA9D0A427751Af201D676719a970857b"

app.use(cors())
app.use(express.json())

app.get('/address', async (req,res) => {
  
  try {
    const ERLocksmith = await EmergentReputation.create(req.query.key, contractAddress)
    res.json({ address: ERLocksmith.getAddress()})
  } catch (e) {
    console.log(e)
    res.status(500).json({message: "Unable to process"})
  }
})

app.get('/relation', async (req, res) => {
  try {
    const ERLocksmith = await EmergentReputation.create(req.body.key, contractAddress)
    res.send( { relation: await ERLocksmith.getTrustRelations(ERLocksmith.getAddress())})
  } catch (e){
    console.log(e)
    res.status(500).json({message: "Unable to process"})
  }
  
})

app.post('/relation', async (req, res) => {
  try {
  const ERLocksmith = await EmergentReputation.create(req.body.key, contractAddress)
  const cid = await ERLocksmith.addTrustRelation(req.body.value, req.body.tier)
  res.send({cid: cid.toString()})
} catch (e) {
  console.log(e)
  res.status(500).json({message: "Unable to process"})
}
})

app.get('/customers', async (req, res) => {
  try {
    console.log("called")
    console.log(req.query.key)
  const ERLocksmith = await EmergentReputation.create(req.query.key, contractAddress)
  const list = await ERLocksmith.getCustomers();
  console.log(list)
  res.send({customers:list})
} catch (e) {
  console.log(e)
  res.status(500).json({message: "Unable to process"})
}
})

app.post('/request-decrypt', async (req, res) => {
  try {
  const ERCustomer = await EmergentReputation.create(req.body.key, contractAddress)
  const tx = await ERCustomer.requestDecryption(req.body.locksmith, req.body.tier);

  res.send({tx:tx})
} catch(e){
  console.log(e)
  res.status(500).json({message: "Unable to process"})
}
})

app.post('/approve-request', async (req, res) => {
  try {
    console.log(req.body.customer)
  const ERLocksmith = await EmergentReputation.create(req.body.key, contractAddress)
  const tx = await ERLocksmith.approveRequest(req.body.customer);

  res.send({tx:tx})
} catch (e){
  console.log(e)
  res.status(500).json({message: "Unable to process"})
}
})


app.post('/get-decrypted-relations', async (req, res) => {
  try {
  const ERCustomer = await EmergentReputation.create(req.body.key, contractAddress)
  const list = await ERCustomer.getDecryptedTrustRelation(req.body.locksmith, req.body.tier);

  res.send({list:list})
} catch (e) {
  console.log(e)
  res.status(500).json({message: "Unable to process"})
}
})

app.post('/clear-funds', async (req, res) => {
  try {
  const ERLocksmith = await EmergentReputation.create(req.body.key, contractAddress)
  const reciept = await ERLocksmith.clearFunds(req.body.customer);

  res.send({reciept:reciept});
  } catch (e) {
    console.log(e)
    res.status(500).json({message: "Unable to process"})
  }
})

app.get('/cid', async (req, res) => {
  try {
    console.log(req.query.cid)
    const payload = await EmergentReputation.read_data(req.query.cid)
    console.log(payload.T3)
    res.send({payload: {
        T0: payload.T0.map(x=> String.fromCharCode.apply(null, x)),
        T1: payload.T1.toString(),
        T2: payload.T2.toString(),
        T3: payload.T3.toString()
      }
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({message: "Unable to load data"})
  }
})

app.listen(8080)