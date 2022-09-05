// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Reputation {
    bytes REK;
    bytes tag;

    constructor() {
        tag = abi.encode("tag");
    }
    
    function getTag() public view returns (bytes memory) {
        return tag;
    }

    function store(bytes memory R1, bytes memory R2, bytes memory R3) public {
        REK = abi.encode(R1, R2, R3);
    }

    function retrieve() public view returns (bytes memory r1, bytes memory r2, bytes memory r3) {
        (r1,r2,r3) = abi.decode(REK, (bytes,bytes,bytes));
    }

    /*
        The payment lifecycle of a proposal flow steps through 3 (+1 implict) phases.

        - When an entity requests the trust graph of an individual it
          gets put into a REQUESTED state.

        - When this entity has been responded to by the owner of the trust graph
          with a re-encryption key, the phase steps to responded.

        - @(ckartik): TODO: Implement a proper validation step using ZK proofs of 
                      correct re-encryption key generation.
        The final step is closed, when the re-encryption key has been deemed valid.
        This can be done when an optimistic oracle has not disputed a correctness claim
        or if a certificate ZK Proof is provided.
    */
    enum PaymentLifeCycle{UNSET,REQUESTED,RESPONDED,CLEARED}
   
    // REKs are a set of Re-encryption keys posted to respond to a payment request for the users trust list.
    mapping (address=>mapping(address=>string)) REKs;

    function getAddress() public view returns (address) {
        console.log("Sender is %s", msg.sender);
        return msg.sender;
    }

    // Pair of relevant values to move through queue.
    mapping(address=>address[]) requestQueue;
    mapping(address=>uint256) handled;

    mapping (address=>mapping(address=>PaymentLifeCycle)) requestForREKStage;
    mapping (address=>bytes) publicKeys;

    function getCurrentREKRequestState(address targetAddress) public view returns (PaymentLifeCycle) {
        return requestForREKStage[targetAddress][msg.sender];
    }
    function getPublicKey(address targetAddress) public view returns (bytes memory) {
        return publicKeys[targetAddress];
    }
    /* 
        TODO(@ckartik): Vunreability.
        Need to somehow block an attack where users overload the list with requests.
    */
    function makeRequestForTrustRelationsDecryption(address targetAddress, bytes memory publicKey) payable public {
        // Require user at this stage to not be in requested/responded state.
        require(requestForREKStage[targetAddress][msg.sender] == PaymentLifeCycle.UNSET, "ALREADY_REQUESTED");
        require(msg.value >= 10**11, "INSUFICENT_PAYMENT");
        requestQueue[targetAddress].push(msg.sender);
        requestForREKStage[targetAddress][msg.sender] = PaymentLifeCycle.REQUESTED;
        publicKeys[msg.sender] = publicKey;
    }


    /*
        Free Look up of CID info.
            - If un-encrypted, the data will be accessible without requirement of payment.
    */
     
    // Trusted presents a mapping between addresses and the CIDs holding a list of nodes 
    // that are part of it's edge set.
    mapping (address=>string) Trusted;

    // Overloaded for backward comptitatibilty
    function getCIDFor(address query) public view returns (string memory) {
        return Trusted[query];
    }

    function getCID() public view returns (string memory) {
        console.log("SMART CONTRACT: GETCID %s ", msg.sender);
        console.log("Stored CID is %s", Trusted[msg.sender]);
        return Trusted[msg.sender];
    }

    function updateTrustRelations(string memory CID) public {
        console.log("SMART CONTRACT: SENDER %s ", msg.sender);
        console.log("SMART CONTRACT: SENDER CID %s ", CID);
        Trusted[msg.sender] = CID;
    }

    function removeTrustRelations() public {
        if (bytes(Trusted[msg.sender]).length == 0) {
            console.log("Sender %s has no data stored in the system", msg.sender);
            return;
        }
        delete Trusted[msg.sender];
        console.log("Sender %s has been removed from the system", msg.sender);
    }
    
    function postREK(string memory targetAddress) public view {
        // bytes memory mapkey = abi.toAss;
        // string postingAddress = Strings.toString(uint256(uint160(msg.sender)));

        console.log(string(abi.encode(msg.sender, targetAddress)));
        
    }
}