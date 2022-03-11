# IPFS v.s IPLD
- IPFS is a encoded collection of blobs of data.
- the CIDs associated with them.

## IPFS
- Only small files (within block size) are stored inside a single blob.
- Otherwise files are split into multiple blocks and linked in a graph.
- The root CID is linked to multiple other CIDs that link to de-dupped chumks of the data.

## IPLD
- You can link multiple addressing systems together.
- The CIDs "codec" can tell you how to decode the data when
its located and load its bytes. For example, JSON (0x0200).
- [More Details on Formats](https://multiformats.io)
- IPFS uses specific CODEC with IPLD, called DAG-PB (Protobuf), however
  we can abstract this, to move away from files to more generalized data-objects.

## Merkle DAGs
    - A DAG with authenticated links down-stream through inclusion of recursive hashes.
    - Can have data throughout the data-structure.
## Questions
1. Could we store entire map data-structure on IPLD?
