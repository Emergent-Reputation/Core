// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { 
    ISuperfluid 
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import { 
    IConstantFlowAgreementV1 
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {
    CFAv1Library
} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

import {
    IERC20
} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CFALibraryMock {

    using CFAv1Library for CFAv1Library.InitData;
    
    //initialize cfaV1 variable
    CFAv1Library.InitData public cfaV1;
    mapping(address=>uint) stakedAmount;
    IERC20 token = IERC20(0x2eB320E2100A043401e3B3B132d4134F235A6A04);
    
    constructor(
        ISuperfluid host
    ) {
    
    //initialize InitData struct, and set equal to cfaV1
    cfaV1 = CFAv1Library.InitData(
        host,
        //here, we are deriving the address of the CFA using the host contract
        IConstantFlowAgreementV1(
            address(host.getAgreementClass(
                    keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1")
                ))
            )
        );
    }
    
    function stake(uint amt) public{
        token.transferFrom(msg.sender, this.address, amt);
        stakedAmount[msg.sender] += amt;
    }
    //your contract code here...
}