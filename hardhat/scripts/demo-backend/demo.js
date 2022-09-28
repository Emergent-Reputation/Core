const express = require('express')
var cors = require('cors');

const app = express()


const  {EmergentReputation, SecurityLevels} = require('../../../sdk/emergent-reputation');

// NOTE: This contract address needs to contains CIDs that exist in an accessible IPFS/IPLD
const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

app.use(cors())
app.use(express.json())

app.get('/address', async (req,res) => {
  
  try {
    const ERLocksmith = await EmergentReputation.create(req.query.key, contractAddress)
    res.json({ address: ERLocksmith.getAddress()})
  } catch {
    res.status(500).json({message: "Unable to process"})
  }
})

app.get('/relation', async (req, res) => {
  try {
    const ERLocksmith = await EmergentReputation.create(req.body.key, contractAddress)
    res.send( { relation: await ERLocksmith.getTrustRelations(ERLocksmith.getAddress())})
  } catch {
    res.status(500).json({message: "Unable to process"})
  }
  
})

app.post('/relation', async (req, res) => {
  try {
  const ERLocksmith = await EmergentReputation.create(req.body.key, contractAddress)
  const cid = await ERLocksmith.addTrustRelation(req.body.value, req.body.tier)
  res.send({cid: cid.toString()})
} catch {
  res.status(500).json({message: "Unable to process"})
}
})

app.get('/customers', async (req, res) => {
  try {
  const ERLocksmith = await EmergentReputation.create(req.body.key, contractAddress)
  const list = await ERLocksmith.getCustomers();

  res.send({customers:list})
} catch {
  res.status(500).json({message: "Unable to process"})
}
})

app.post('/request-decrypt', async (req, res) => {
  try {
  const ERCustomer = await EmergentReputation.create(req.body.key, contractAddress)
  const tx = await ERCustomer.requestDecryption(req.body.locksmith, req.body.tier);

  res.send({tx:tx})
} catch {
  res.status(500).json({message: "Unable to process"})
}
})

app.post('/approve-request', async (req, res) => {
  try {
  const ERLocksmith = await EmergentReputation.create(req.body.key, contractAddress)
  const tx = await ERLocksmith.approveRequest(req.body.customer);

  res.send({tx:tx})
} catch {
  res.status(500).json({message: "Unable to process"})
}
})


app.post('/get-decrypted-relations', async (req, res) => {
  try {
  const ERCustomer = await EmergentReputation.create(req.body.key, contractAddress)
  const list = await ERCustomer.getDecryptedTrustRelation(req.body.locksmith, req.body.tier);

  res.send({list:list})
} catch {
  res.status(500).json({message: "Unable to process"})
}
})

app.post('/clear-funds', async (req, res) => {
  try {
  const ERLocksmith = await EmergentReputation.create(req.body.key, contractAddress)
  const reciept = await ERLocksmith.clearFunds(req.body.customer);

  res.send({reciept:reciept});
  } catch {
    res.status(500).json({message: "Unable to process"})
  }
})

app.get('/cid', async (req, res) => {
  try {
    console.log(req.query.cid)
    const payload = await EmergentReputation.read_data(req.query.cid)

    res.send({payload:payload})
  } catch {
    res.status(500).json({message: "Unable to load data"})
  }
})

app.listen(8080)