pragma solidity ^0.4.24;

import './DNSBid.sol';
import "./DNSStates.sol";
import "./DNSDataModel.sol";

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

    // map Bidder to his/her value (address as key and ether as value)
    mapping (address => uint) public dnsBalanceMap;

    // winning bidder's address
    address  public bestBidder;

    //constructor with indicativePrice from the bidder
    constructor(uint _indicativePrice) public {
        indicativePrice = _indicativePrice;
        dnsBidState = DNSStates.BidRegistryState.ACTIVE;
    }



    /**
    * A new Bid placed (top bid)
    *
    * Control will reach this point after crossing all checks for :
    *
    * 1. best-bid (highest price quoted)
    * 3. bidder is not same as name-owner
    * 3. name is a valid name (name exists in the registry)
    *
    */
    function makeNewBid(uint _bidPrice, address _bidderAddress) public returns(bool transactionCompletionIndicator) {

        //create a new BidEntry Holder
        DNSBid dnsBidEntry = new DNSBid(_bidPrice,_bidderAddress);

        //map the bidder address with the bidEntry
        dnsBidMap[_bidderAddress] = dnsBidEntry;

        //add bidPrice to the current-state (value) of the bidder(address)
        dnsBalanceMap[_bidderAddress] += _bidPrice;

        //indicativePrice (current price) of the bid will be the bestBidder's price
        indicativePrice = _bidPrice;

        //assign the bidder to bestBidder-address
        bestBidder = _bidderAddress;

        //mark the completion of recording best-bid entry
        return true;
    }



    /**
     * update dnsBidEntry Status
     * can be performed only for the bidder whose entry exists in the dnsBidMap
     *
     */
    function updateBidState(address _bidderAddress, DNSStates.BidStates _bidState, bool _active) public returns(bool bidStateSet)
    {
        //lookup dbsBidEntry from dnsBidMap for the bidder (using bidderAddress)
        DNSBid dnsBidEntry = dnsBidMap[_bidderAddress];

        //bidState can be updated on only active dnsBids
        require(dnsBidEntry.active() == true);

        //validate if the bidState is being updated by the bidder itself
        require(dnsBidEntry.owner() == _bidderAddress);

        //set ther bidState of the bidEntry with input argument (must be an enum)
        dnsBidEntry.setBidState(_bidState);

        //set the active Indicator to bidEntry
        dnsBidEntry.setActive(_active);

        //mark the completion of recording bidState
        return true;
    }

    /**
     * get bid-Amount by BidderAddress
     * can be performed only if the bidder has an active bid in the dnsBidEntry
     */
    function getHighestBidByBidderAddress(address _bidderAddress) public view returns(uint highestBidValue){

        require(dnsBidMap[_bidderAddress].active() == true);

        //extract the best-bid made by the bidder
        DNSBid dnsBidEntry = dnsBidMap[_bidderAddress];

        //check if dnsBid is active
        require(dnsBidEntry.active() == true);

        return dnsBidEntry.amount();
    }



    /**
     * get total bid-Amount by BidderAddress
     * can be performed only if the bidder exists in the dnsBalanceMap
     */
    function getTotalFundsOfABidder(address _bidderAddress) public view returns(uint bidderFunds){

        return dnsBalanceMap[_bidderAddress];
    }


    function deductFundsFromWinningBidder(address _bidderAddress, uint _winningBidAmount) public returns (bool isSuccessful){

        dnsBalanceMap[_bidderAddress] -= _winningBidAmount;

        return true;
    }










}
