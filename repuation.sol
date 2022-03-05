// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


contract Repuation {
    mapping (address=>string) Trusted;

    function update_trust_relations(string memory CID) public {
        Trusted[msg.sender] = CID;
    }
}