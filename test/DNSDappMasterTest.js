var DNSDappMaster = artifacts.require('DNSDappMaster')

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

  it('assert that system can Reserve a new DNSName', function () {
    let nameOwner = accounts[1]
    return DNSDappMaster.deployed().then(function (instance) {
      return instance.reserveDNSName('lakshmikanth.p', { from: nameOwner, value: web3.toWei(1, 'ether') })
        .then(function (result) {
          assert.isOk(result.receipt)
          return instance.isAValidDNSNameString.call('lakshmikanth.p').then(function (reservationEvent) {
            assert.equal(reservationEvent, true, 'lakshmikanth.p is now reserved')
          })
        })
    })
  })

  it('assert that system can Reserve a new DNSName and Transfer funds by using DNSName', function () {
    let nameOwner = accounts[1]
    let etherSender = accounts[2]
    return DNSDappMaster.deployed().then(function (instance) {
      return instance.reserveDNSName('lakshmikanth', { from: nameOwner, value: web3.toWei(1, 'ether') })
        .then(function (result) {
          assert.isOk(result.receipt)
          return instance.isAValidDNSNameString.call('lakshmikanth').then(function (reservationEvent) {
            assert.equal(reservationEvent, true, 'lakshmikanth is now reserved')
          })
        })
        .then(function () {
          return instance.transferEtherByDNSName('lakshmikanth', { from: etherSender, value: web3.toWei(0.1, 'ether') })
            .then(function (result) {
              assert.isOk(result.receipt)
            })
        })
    })
  })

  it('assert that system cannot Transfer funds to non-existing DNSName', function () {
    let nameOwner = accounts[1]
    let etherSender = accounts[2]
    return DNSDappMaster.deployed().then(function (instance) {
      return instance.reserveDNSName('lakshmi.kanth', { from: nameOwner, value: web3.toWei(1, 'ether') })
        .then(function (result) {
          assert.isOk(result.receipt)
          return instance.isAValidDNSNameString.call('lakshmi.kanth').then(function (reservationEvent) {
            assert.equal(reservationEvent, true, 'lakshmi.kanth is now reserved')
          })
        })
        .then(function () {
          return instance.transferEtherByDNSName('lakshmikanth.pk', { from: etherSender, value: web3.toWei(2, 'ether') })
            .then(function (result) {
              assert.fail(result.receipt)
            })
        })
    })
  })
})
