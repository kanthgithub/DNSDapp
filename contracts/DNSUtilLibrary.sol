pragma solidity ^0.4.24;


contract DNSUtilLibrary {

    // convert string to Bytes32
    function toBytes32(string memory source) public pure returns (bytes32)
    {
        return stringToBytes32(source);
    }

    function stringToBytes32(string memory source) internal pure returns (bytes32 result)
    {
        assembly {
            result := mload(add(source, 32))
        }

        return result;
    }

}
