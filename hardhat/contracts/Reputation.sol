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
        return Trusted[msg.sender];
    }

    function updateTrustRelations(string memory CID) public {
        console.log("SMART CONTRACT: SENDER %s ", msg.sender);
        Trusted[msg.sender] = CID;
    }
}