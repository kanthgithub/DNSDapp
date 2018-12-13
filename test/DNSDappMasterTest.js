var DNSDappMaster = artifacts.require('DNSDappMaster');

// contract is deployed using account[1]
contract('DNSDappMaster', function (accounts) {
  //  assert that name shouldn't exist
  it('assert that non-existent name check returns false', function () {
    return DNSDappMaster.deployed().then(function (instance) {
      return instance.isAValidDNSNameString.call('alien')
    }).then(function (reserved) {
      assert.equal(reserved, false, 'alien does not exists in the DNS as of now')
    })
  })
})
