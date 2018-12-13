pragma solidity ^0.4.24;

library DNSDataModel {

    struct DNSData {
        address nameOwner;
        bytes32 name;
        uint price;
        bool active;
    }
}
