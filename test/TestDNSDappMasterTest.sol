pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/DNSDappMaster.sol";

contract TestDNSDappMasterTest {

    uint public initialBalance = .50 ether;

    uint public MIN_RESERVATION_FEE = 0.11 ether;

    DNSDappMaster dnsDappMaster =  DNSDappMaster(DeployedAddresses.DNSDappMaster());

    function testForNonExistentDNSName() public  {

        bool doesDNSNameExist = dnsDappMaster.isAValidDNSNameString('alien');

        Assert.equal(doesDNSNameExist,false,'asserted');
    }


    function testReserveDNSName() public  {

        string memory dnsNameForReservation  = "singapura";

        dnsDappMaster.reserveDNSName.value(MIN_RESERVATION_FEE)(dnsNameForReservation);
    }



}
