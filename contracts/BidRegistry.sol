pragma solidity ^0.4.24;

import './DNSBid.sol';

//contract to store the registered bids as well as winning bids
//also maintains the entries/audit of all Bids
contract BidRegistry {

    using DNSStates for DNSStates.BidStates;
    using DNSStates for DNSStates.BidRegistryState;

    //indicative/current price of the bid
    uint public indicativePrice;

    //bid state of DNS
    DNSStates.BidRegistryState public dnsBidState;

    //map to store all bids and respective bidder-address
    mapping(address => DNSBid) public dnsBidMap;

    // all registered bids are stored in the balance-map
    mapping (address => uint) public dnsBalanceMap;

    // winning bidder's address
    address  public topBidder;

    function BidRegistry(uint _indicativePrice) public {
        indicativePrice = _indicativePrice;
        dnsBidState = DNSStates.BidRegistryState.ACTIVE;
    }

}
