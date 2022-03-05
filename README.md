# Emergent Reputation System

## Problem Statement
The lack of reputation clearly associated with entites creating content on social media platforms like Twitter
creates a lacking experience for users. Add to that foreign interference through coordinated efforts to produce 
porpoganada as described 
[here](https://symantec-enterprise-blogs.security.com/blogs/threat-intelligence/twitterbots-propaganda-disinformation),
and it clearly makes for an unusable experience for social communication and coordination.

## Solution
The natural aspect of interactions between agents in the metaverse help to determine the reliability of individuals.
We leverage this charecteristic as a basis to build an emergent reputation system. This system is meant to emulate traditional
[key signing parties](https://en.wikipedia.org/wiki/Key_signing_party), in an automated and out-of-the-way fashion for lay users.

## Design Specification
The input payload will consist of the verfication address associated with the User we will describe as _U<sub>orginal</sub>_.

After interacting with _U<sub>original</sub>_ , an arbtirary user _U<sub>adj</sub>_ can sign the 
verfication key of _U<sub>orginal</sub>_. This will produce a signature that  _U<sub>orginal</sub>_ can append to their 
signature list along with their associated public key/verfication key. To incentivise _U<sub>adj</sub>_ to conduct due dilligence, 
they signing will incurr a cost onto _U<sub>adj</sub>_ with a possibilty of accruing rewards for the action (TODO?).
![](/assets/diag1.jpg)

To make the resulting hash (CID) from the payload that contains the [web-of-trust](https://en.wikipedia.org/wiki/Web_of_trust) associated with the identity, easily accesible, we pin it to the smart-contract that will underpin this trust system.
```solidity

contract Repuation {
    mapping (address=>string) Trusted;

    function update_trust_relations(string memory CID) public {
        Trusted[msg.sender] = CID;
    }
}
```

