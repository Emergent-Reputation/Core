console.log("hello world")

fs = require('fs')
const { Readable } = require('stream')
// js-multiformats basic pieces for dealing with blocks and CIDs
const { CID } = require('multiformats/cid')
const Block = require('multiformats/block')

// Multihashers
const { sha256 } = require('multiformats/hashes/sha2')
// some other multihashers that may be of interest:
// import { blake2b256 } from '@multiformats/blake2/blake2b'
// import { sha3256 } from '@multiformats/sha3'
// import { sha3512 } from '@multiformats/sha3'
// see https://github.com/multiformats/js-multiformats#multihash-hashers-1

// IPLD codecs
const raw = require('multiformats/codecs/raw')
const dagJSON = require('@ipld/dag-json')
const dagCBOR = require('@ipld/dag-cbor')
// some other codecs that may be of interest:
// import * as json from 'multiformats/codecs/json'
// import * as dagPB from '@ipld/dag-pb'
// import * as dagJOSE from 'dag-jose'
// see https://github.com/multiformats/js-multiformats#ipld-codecs-multicodec

// CAR utilities, see https://github.com/ipld/js-car for more info
const { CarWriter } = require( '@ipld/car/writer')
const { CarReader } = require( '@ipld/car/reader')


const utf8Encoder = new TextEncoder()
const utf8Decoder = new TextDecoder()

async function createBlocks () {
  const payload = await Block.encode({
    value: {
      name: "Kartik Chopra"
    },
    hasher: sha256,
    codec: dagCBOR
  })

  console.log(payload.cid)

  const { writer, out } = await CarWriter.create([payload.cid])
  Readable.from(out).pipe(fs.createWriteStream('ipld-local.car'))

  writer.put(payload)

  await writer.close()

  return payload.cid
}
async function readBlocks (payloadCID) {
  console.log("I GET CALLEd")
  const inStream = fs.createReadStream('ipld-local.car')
  console.log("I GET CALLEd")
  console.log(inStream)
  const reader = await CarReader.fromIterable(inStream)
  console.log("I GET CALLEd")

  const recovered_payload = await reader.get(payloadCID)

  console.log(dagCBOR.decode(recovered_payload.bytes))
}

// createBlocks().then(readBlocks((pcid) => CID.parse(pcid)))

async function code(){


const utf8Encoder = new TextEncoder()
const utf8Decoder = new TextDecoder()

const payload = await Block.encode({
  value: {
    name: "Kartik Chopra"
  },
  hasher: sha256,
  codec: dagCBOR
})

console.log(payload.cid)

const { writer, out } = await CarWriter.create([payload.cid])
Readable.from(out).pipe(fs.createWriteStream('ipld-local.car'))

writer.put(payload)

await writer.close()


const inStream = fs.createReadStream('ipld-local.car')
const reader = await CarReader.fromIterable(inStream)

const recovered_payload = await reader.get(payload.cid)

console.log(dagCBOR.decode(recovered_payload.bytes))
}
code()