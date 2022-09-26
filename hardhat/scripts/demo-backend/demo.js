const express = require('express')
const app = express()


const  {EmergentReputation, SecurityLevels} = require('../../../sdk/emergent-reputation');

// NOTE: This contract address needs to contains CIDs that exist in an accessible IPFS/IPLD datastore.
const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"


app.use(express.json())

app.get('/address', async (req,res) => {
  const ERLocksmith = await EmergentReputation.create(req.body.key, contractAddress)

  res.send(ERLocksmith.getAddress())
})

app.get('/relation', async (req, res) => {
  const ERLocksmith = await EmergentReputation.create(req.body.key, contractAddress)
  res.send( await ERLocksmith.getTrustRelations(ERLocksmith.getAddress()))
})

app.post('/relation', async (req, res) => {
  const ERLocksmith = await EmergentReputation.create(req.body.key, contractAddress)
  const cid = await ERLocksmith.addTrustRelation(req.body.value, req.body.tier)
  res.send(cid)
})

app.get('/customers', async (req, res) => {
  const ERLocksmith = await EmergentReputation.create(req.body.key, contractAddress)
  const list = await ERLocksmith.getCustomers();

  res.send(list)
})

app.post('/request-decrypt', async (req, res) => {
  const ERCustomer = await EmergentReputation.create(req.body.key, contractAddress)
  const tx = await ERCustomer.requestDecryption(req.body.locksmith, req.body.tier);

  res.send(tx)
})

app.post('/approve-request', async (req, res) => {
  const ERLocksmith = await EmergentReputation.create(req.body.key, contractAddress)
  const tx = await ERLocksmith.approveRequest(req.body.customer);

  res.send(tx)
})


app.post('/get-decrypted-relations', async (req, res) => {
  const ERCustomer = await EmergentReputation.create(req.body.key, contractAddress)
  const list = await ERCustomer.getDecryptedTrustRelation(req.body.locksmith, req.body.tier);

  res.send(list)
})

app.post('/clear-funds', async (req, res) => {
  const ERLocksmith = await EmergentReputation.create(req.body.key, contractAddress)
  const reciept = await ERLocksmith.clearFunds(req.body.customer);

  res.send(reciept);
})

app.listen(8080)