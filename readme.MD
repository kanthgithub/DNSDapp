# Decentralized Name registration and fund-transfer Application (DNS-Dapp)

# What does this do?

  - Manage name registry on decentralized platform (ethereum)
  - Buy/Sell via Bidding process for tamper-proof and best price mechanism
  - Transfer funds (ether) via names (registered)
  - Release names for a better price via bidding
    
# Use Cases:
  
1.  Checking the availability for a name
2.	Reserve a name if available, by sending a tx with amount of ether
3.	Release name by making it available (can be released only by their owners)
5.	Bid on names already taken (bids must be > original price)
7.	Owner of domain can change the ownership of the domain to the highest bidder
8.	Name can be used to send ether to its owner


# Technology Stack:

1. ethereum (ganache-cli)
2. truffle
3. nodeJS
4. web3
5. eslint

# DataModel:

- Bid DataModel:

  - DataModel to store Bid Details for a given DNSName
  - bidState in the model represents different states bid can stay in the workflow
  - amount is the bidPrice made by Bidder
  - owner is the address of the Bidder

```solidity
contract DNSBid {

    using DNSStates for DNSStates.BidStates;
    DNSStates.BidStates public bidState;
    bool public active;
    uint public amount;
    address public owner ;
    }
```


- Bid States:

  - enum to hold the states that bid can go through in a Bid-Life cycle

```solidity
enum BidStates {
        BID_VOID,
        BID_OPEN,
        BID_ACCEPTED
    }
```


- Bid Registry:

 - A Container/Registry to hold all details/bids made for a given DNSName
 - Contains the storage for mappings:
 
    - dnsBidMap : map to store all bids and respective bidder-addresses
    - dnsBalanceMap : map to store the bidder-Address as key and bid-Price as Value
    - bestBidder : Address of the Bidder whose bid was highest (indicative price)
    
 ```solidity

    //map to store all bids and respective bidder-address
    mapping(address => DNSBid) public dnsBidMap;

    // map Bidder to his/her value (address as key and ether as value)
    mapping (address => uint) public dnsBalanceMap;

    // winning bidder's address
    address  public bestBidder;

```


# Solidity contract diagram:





# Sequence Diagram





# Tests:

1. Javascript Tests
2. Solidity Tests (In-Progress)

# Deployment:

- checkout source code
- navigate to source directory
- run npm install
- run truffle compile
- run truffle migrate
- run truffle test

# Testnet Verification:

Rinkeby Testnet (Infura) - Inprogress

# Improvements / TODO:

1. UI on ReactJS
2. End to End tests
3. Use security mechanisms to avoid Re-entry and other DApp based attacks
