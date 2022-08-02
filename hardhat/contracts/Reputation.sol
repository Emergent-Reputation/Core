// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Reputation {
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
}