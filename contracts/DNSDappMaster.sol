pragma solidity ^0.4.18;

import './DNSUtilLibrary.sol';
import './BidRegistry.sol';
import './DNSDataModel.sol';
import './DNSStates.sol';
import './DNSBid.sol';

contract DNSDappMaster is DNSUtilLibrary {

    // constructor
    function DNSDappMaster() public {
        dnsRegistryOwner = msg.sender;
        DnsNameCreatedEvent(msg.sender);
    }

    // mapping for name to corresponding bidRegistry for name
    mapping (bytes32 => BidRegistry) bidRegistryMap;

    // map address to DNSDatModel
    mapping (bytes32 => DNSDataModel.DNSData) dnsNameDataModelMap;

    //pre-bid transaction-fees goes to contract creator
    address dnsRegistryOwner;

    //declare events
    event DnsNameCreatedEvent(address _dnsRegistryOwner);

    function addNewDNSEntry(bytes32 _dnsName, uint _reservationFees) private returns (bool _isSuccessful)
    {
        dnsNameDataModelMap[_dnsName].name = _dnsName;
        dnsNameDataModelMap[_dnsName].nameOwner = msg.sender;
        dnsNameDataModelMap[_dnsName].price = _reservationFees;
        dnsNameDataModelMap[_dnsName].active = true;
        return true;
    }

    function verifyName(string _dnsName) public view returns(bool _exists)
    {
        bytes32 dnsName = toBytes32(_dnsName);
        return hasDNSOwner(name);
    }

    function hasDNSOwner(bytes32 _dnsName) internal view returns (bool _nameExists) {
        return dnsNameDataModelMap[_dnsName].active;
    }


    function checkForValidityOfDNSNameBid(uint _reservationFees) pure internal returns (bool)
    {
        if (_reservationFees < 1 finney) {
            return false;
        }

        return true;
    }




}
