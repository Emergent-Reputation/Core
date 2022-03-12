console.log("hello world")

import fs from 'fs'
import { Readable } from 'stream'
// js-multiformats basic pieces for dealing with blocks and CIDs
import { CID } from 'multiformats/cid'
import * as Block from 'multiformats/block'

// Multihashers
import { sha256 } from 'multiformats/hashes/sha2'
// some other multihashers that may be of interest:
// import { blake2b256 } from '@multiformats/blake2/blake2b'
// import { sha3256 } from '@multiformats/sha3'
// import { sha3512 } from '@multiformats/sha3'
// see https://github.com/multiformats/js-multiformats#multihash-hashers-1

// IPLD codecs
import * as raw from 'multiformats/codecs/raw'
import * as dagJSON from '@ipld/dag-json'
import * as dagCBOR from '@ipld/dag-cbor'
// some other codecs that may be of interest:
// import * as json from 'multiformats/codecs/json'
// import * as dagPB from '@ipld/dag-pb'
// import * as dagJOSE from 'dag-jose'
// see https://github.com/multiformats/js-multiformats#ipld-codecs-multicodec

// CAR utilities, see https://github.com/ipld/js-car for more info
import { CarWriter } from '@ipld/car/writer'
import { CarReader } from '@ipld/car/reader'


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