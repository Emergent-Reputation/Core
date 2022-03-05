// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


contract Reputation {
    mapping (address=>string) Trusted;

    function getCID() public view returns (string memory) {
        return Trusted[msg.sender];
    }

    function updateTrustRelations(string memory CID) public {
        Trusted[msg.sender] = CID;
    }
}