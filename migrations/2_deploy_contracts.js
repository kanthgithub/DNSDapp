/* eslint-disable space-before-function-paren */
var DNSDappMaster = artifacts.require('DNSDappMaster')

module.exports = function (deployer) {
  deployer.deploy(DNSDappMaster)
}
