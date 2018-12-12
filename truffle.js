// required to be compliant with ES6
require('babel-register')

module.exports = {
  networks: {
    local: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      from: '0xc09ce78fcbf772d5cfa1b88fbbf872279debf0ef',
      gas: 4500000
    }
  }
}
