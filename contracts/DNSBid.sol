pragma solidity ^0.4.0;

import "./DNSStates.sol";

contract DNSBid {

    using DNSStates for DNSStates.BidStates;
    DNSStates.BidStates public bidState;
    bool public active;
    uint public amount;
    address public owner ;

    constructor(uint _amount, address _owner) public {
        amount = _amount;
        owner = _owner;
        bidState = DNSStates.BidStates.BID_OPEN;
        active = true;
    }

    function getBidState() public constant returns (DNSStates.BidStates) {
        return bidState;
    }

    function setBidState(DNSStates.BidStates _bidState) public {
        bidState = _bidState;
    }

    function setActive(bool _active) public {
        active = _active;
    }
}
