pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/DNSDappMaster.sol";

contract TestDNSDappMasterTest {

    DNSDappMaster dnsDappMaster =  DNSDappMaster(DeployedAddresses.DNSDappMaster());

    function assertForNonExistentDNSName() public  {

        bool doesDNSNameExist = dnsDappMaster.isAValidDNSNameString('asas');

        Assert.equal(doesDNSNameExist,false,'asserted');
    }

}
