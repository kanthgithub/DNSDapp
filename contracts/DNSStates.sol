pragma solidity ^0.4.24;

library DNSStates {

    enum BidStates {
        BID_VOID,
        BID_OPEN,
        BID_ACCEPTED
    }

    enum BidRegistryState {
        VOID,
        ACTIVE,
        INACTIVE
    }
}
