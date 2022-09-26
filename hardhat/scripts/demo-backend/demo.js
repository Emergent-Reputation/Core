const Web3 = require("web3")
const web3 = new Web3()


const express = require('express')
const app = express()


const  {EmergentReputation, SecurityLevels} = require('../../../sdk/emergent-reputation');
app.use(express.json())
const contractAddress = "0xEa4Df49aEe4bB81EcDE7dB26dD638F2B6DfCC961"

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


app.listen(8080)