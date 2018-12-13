pragma solidity ^0.4.24;

import './DNSUtilLibrary.sol';
import './BidRegistry.sol';
import './DNSDataModel.sol';
import './DNSStates.sol';
import './DNSBid.sol';


contract DNSDappMaster is DNSUtilLibrary {

    // constructor
    constructor() public {
        dnsRegistryOwner = msg.sender;
        emit DnsNameCreatedEvent(msg.sender);
    }

    // map address to DNSDatModel (key: dnsNameOwner, value: DNSDataModel)
    mapping (bytes32 => DNSDataModel.DNSData) dnsNameDataModelMap;

    // mapping for name to corresponding bidRegistry for name
    // key: dnsNameOwner value: BidRegistry (contains all bids received for the owner)
    mapping (bytes32 => BidRegistry) bidRegistryMap;

    //pre-bid transaction-fees goes to contract creator
    address dnsRegistryOwner;

    //declare events
    event DnsNameCreatedEvent(address _dnsRegistryOwner);

    event EtherTransferredToDNSNameEvent(string _dnsName, uint _amount);

    event ReserveDNSNameEvent(string _dnsName , uint _reservationFees, address _reservedAddress, bool _successfulRegistration);

    event BestBidRaiseEvent(address _bestBidderAddress, uint _bestBidPrice);

    event BidFinalizationEvent(string _dnsName, address sender, address bestBidderAddress, uint bestBidPrice);


    function verifyName(string _dnsName) public view returns(bool _exists)
    {
        bytes32 dnsLookupName = toBytes32(_dnsName);

        return hasDNSOwner(dnsLookupName);
    }

    function hasDNSOwner(bytes32 _dnsName) internal view returns (bool _nameExists) {
        return dnsNameDataModelMap[_dnsName].active;
    }


    function checkForValidityOfDNSNameBid(uint _reservationFees) pure internal returns (bool)
    {
        bool isAValidFeesForReservation = true;

        if (_reservationFees < 1 finney) {
            isAValidFeesForReservation = false;
        }

        return isAValidFeesForReservation;
    }


    function transferEtherByDNSName(string _dnsName) public payable returns (bool) {

        //convert dnsName to Bytes
        bytes32 dnsLookupName = toBytes32(_dnsName);

        //check if the dnsName is valid
        require(hasDNSOwner(dnsLookupName));

        uint funds = msg.value;

        //validate if the dnsNameOwner has sufficient balance
        require(msg.sender.balance > funds);

        //get Mapped dnsDataMpdel to local storage
        DNSDataModel.DNSData storage dnsName = dnsNameDataModelMap[dnsLookupName];

        //validate that owner is not sending funds to self
        require(msg.sender != dnsName.nameOwner);

        dnsName.nameOwner.transfer(funds);

        emit EtherTransferredToDNSNameEvent(_dnsName,funds);

        return true;
    }

    /**
    * A new Bid placed
    *
    * This will have essential checks for bidding:
    *
    * 1. best-bid (highest price quoted)
    * 3. bidder is not same as name-owner
    * 3. name is a valid name (name exists in the registry)
    *
    */
    function bidForDNSName(string _dnsName) public payable {

        bytes32  dnsNameLookupValue = toBytes32(_dnsName);

        // name should be owned by someone before you bid
        require(isAValidDNSName(dnsNameLookupValue));

        // owner can't bid for his/her/it's name
        require(msg.sender != dnsNameDataModelMap[dnsNameLookupValue].nameOwner);

        //assert if the this is the highest bid received for this _dnsName
        require(msg.value > findTopBidPriceByDNSName(_dnsName));

        BidRegistry bidRegistry = bidRegistryMap[dnsNameLookupValue];

        uint bidPrice = msg.value;

        bidRegistry.makeNewBid(bidPrice,msg.sender);

        emit BestBidRaiseEvent(msg.sender,msg.value);
    }

    /**
    * find the best Bid Price for a dnsName
    * best bid is retrieved by accessing the bidRegistry of the dnsName
    * bidRegistry contains the indicativePrice / bestPrice of the dnsName
    */
    function findTopBidPriceByDNSName(string _dnsName) public view returns (uint bidPrice){

        //get bytes32 representation of the _dnsName
        bytes32  dnsLookupName = toBytes32(_dnsName);

        // lookup bidRegistry for this _dnsName
        BidRegistry bidRegistry = bidRegistryMap[dnsLookupName];

        //bidRegistry contains bestPrice of all bids recorded for the _dnsName
        return bidRegistry.indicativePrice();
    }

    //find the best-Bidder for a given DNSName from BidRegistry
    function findBestBidderAddressByDNSName(string _dnsName) public view returns(address bestBidderAddress)
    {
        //get bytes32 representation of the _dnsName
        bytes32  dnsName = toBytes32(_dnsName);

        // find the BidContainer for this name
        BidRegistry bidRegistry = bidRegistryMap[dnsName];

        //return bestBidder's address from bidRegistry
        return bidRegistry.bestBidder();
    }


    /**
    * DNSName-Owner selects and finalizes the bestBid
    * Ownership of the DNSName is transferred to the bestBidder's address
    * Best-Bidder's funds are transferred to the current owner of the DNSName
    */
    function finalizeBiddingProcess(string _dnsName) public returns(bool transferred)
    {
        //get bytes32 representation of the _dnsName
        bytes32  dnsName = toBytes32(_dnsName);

        // check for DNSName validity
        require(isAValidDNSName(dnsName));

        // owner should be the one who finalize the bidding-process
        require(msg.sender == dnsNameDataModelMap[dnsName].nameOwner);

        // get the highest bid
        uint bestBidPrice = findTopBidPriceByDNSName(_dnsName);

        // bidFinalizing tracking Indicator
        bool isBidFinalized = false;

        bool fundsTransferredToCurrentOwner = msg.sender.send(bestBidPrice);

        //transfer bestBidPrice to current-Owner of DNSName
        //proceed further only if the bestBid-Price fund is transferred to currentOwner
        if (fundsTransferredToCurrentOwner) {

            //find the best-Bidder Address
            address bestBidderAddress = findBestBidderAddressByDNSName(_dnsName);

            //get bestBidPrice from DNSDataModel (which is the indicativePrice)
            dnsNameDataModelMap[dnsName].price = bestBidPrice;

            //transfer ownership by setting bestBidder's address as DNSName-Owner in DNSDataModel
            dnsNameDataModelMap[dnsName].nameOwner = bestBidderAddress;

            //get bidRegistry for the dnsName
            BidRegistry bidRegistry = bidRegistryMap[dnsName];

            //deduct funds from the best-Bidder's Address (AKA current owner of the DNSName)
            bidRegistry.deductFundsFromWinningBidder(bestBidderAddress,bestBidPrice);

            // as bestBidder has become currentOwner, remove the bestBidder entry from bidRegistry
            // deactivate bes-Bidder's Bid and update BidState as BID_ACCEPTED
            require(bidRegistry.updateBidState(bestBidderAddress,DNSStates.BidStates.BID_ACCEPTED,false) == true);

            isBidFinalized = true;
        }

        //emit BidFinalization event
        emit BidFinalizationEvent(_dnsName, msg.sender, bestBidderAddress, bestBidPrice);


        return isBidFinalized;
    }


    /**
    * reserve a new DNSName
    * Name should be non-existent
    */
    function reserveDNSName(string _dnsName) public payable returns(bool isSuccessful)
    {
        //get bytes32 representation of the _dnsName
        bytes32 dnsNameLookupValue = toBytes32(_dnsName);

        // reserving a DNSName means name shouldn't exist
        require(isDNSNameReservationAllowed(dnsNameLookupValue));

        //get the reservationFee sent by the user
        uint reservationFees = msg.value;

        //check if the reservationFees is acceptable
        require(checkForValidityOfDNSNameBid(reservationFees));

        //send reservationFees to the registryOwner
        bool reservationFeesTransferIndicator = dnsRegistryOwner.send(reservationFees);

        bool isSuccessfullyReserved = false;

        if (reservationFeesTransferIndicator) {

            //add new DNSEntry for _dnsName
            isSuccessfullyReserved = addNewDNSEntry(dnsNameLookupValue,reservationFees);

            // create the BidContainer
            BidRegistry bidRegistry = new BidRegistry(reservationFees);

            // add reservation as a bid to just-created bidRegistryMap
            bidRegistryMap[dnsNameLookupValue] = bidRegistry;

            //emit Reservation-event for new reservation
            emit ReserveDNSNameEvent(_dnsName, reservationFees, msg.sender, isSuccessfullyReserved);
        }

        return isSuccessfullyReserved;
    }


    function addNewDNSEntry(bytes32 _dnsName, uint _reservationFees) private returns (bool _isSuccessful)
    {
        dnsNameDataModelMap[_dnsName].name = _dnsName;
        dnsNameDataModelMap[_dnsName].nameOwner = msg.sender;
        dnsNameDataModelMap[_dnsName].price = _reservationFees;
        dnsNameDataModelMap[_dnsName].active = true;
        return true;
    }



    function isAValidDNSName(bytes32 _dnsName) internal view returns (bool _isValid) {

        DNSDataModel.DNSData storage dnsData = dnsNameDataModelMap[_dnsName];

        return dnsData.active;
    }

    function isDNSNameReservationAllowed(bytes32 _dnsName) internal view returns (bool _isValid) {
        return !isAValidDNSName(_dnsName);
    }

    function isAValidDNSNameString(string _dnsName) public view returns (bool _isValid) {

        //get bytes32 representation of the _dnsName
        bytes32 dnsNameLookupValue = toBytes32(_dnsName);

       return isAValidDNSName(dnsNameLookupValue);
    }


}
