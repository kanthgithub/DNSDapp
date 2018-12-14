// required to be compliant with ES6
require('babel-register')

module.exports = {
  networks: {
    local: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      from: '0x917f740e77ac746938a58ad6b5248692174112fe',
      gas: 4500000
    }
  }
}
