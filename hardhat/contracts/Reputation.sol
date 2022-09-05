// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Reputation {
    bytes REK;

    function store(bytes memory R1, bytes memory R2, bytes memory R3) public {
        REK = abi.encode(R1, R2, R3);
    }

    function retrieve() public view returns (bytes memory) {
        return REK;
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
    enum PaymentLifeCycle{REQUESTED,RESPONDED,CLOSED}
    
    // Trusted presents a mapping between addresses and the CIDs holding a list of nodes 
    // that are part of it's edge set.
    mapping (address=>string) Trusted;

    // REKs are a set of Re-encryption keys posted to respond to a payment request for the users trust list.
    mapping (address=>mapping(address=>string)) REKs;


    mapping (address=>mapping(address=>bool)) requestAddresses; 
    
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