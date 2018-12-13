/* eslint-disable max-len,padded-blocks */
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
  it('assert that system cannot Reserve on an existing and active DNSName', function () {
    let nameOwner = accounts[1]
    return DNSDappMaster.deployed().then(function (instance) {
      return instance.reserveDNSName('lakshmikanth.p', { from: nameOwner, value: web3.toWei(1, 'ether') })
        .then(function (result) {
          assert.isOk(result.receipt)
          return instance.isAValidDNSNameString.call('lakshmikanth.p').then(function (reservationEvent) {
            assert.equal(reservationEvent, true, 'lakshmikanth.p is now reserved')
          })
        }).then(function () {
          return instance.reserveDNSName('lakshmikanth.p', { from: nameOwner, value: web3.toWei(1, 'ether') })
            .then(function (result) {
              assert.isNotOk(result.receipt)
            }).catch(function (ex) {
              console.log('asserted that system cannot reserve an existing DNSName')
            })
        })
    })
  })

  it('assert that system can Reserve a new DNSName', function () {
    let nameOwner = accounts[1]
    return DNSDappMaster.deployed().then(function (instance) {
      return instance.reserveDNSName('lakshmikanth.pabbisetti', { from: nameOwner, value: web3.toWei(1, 'ether') })
        .then(function (result) {
          assert.isOk(result.receipt)
          return instance.isAValidDNSNameString.call('lakshmikanth.pabbisetti').then(function (reservationEvent) {
            assert.equal(reservationEvent, true, 'lakshmikanth.pabbisetti is now reserved')
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
    let etherSender = accounts[2]
    return DNSDappMaster.deployed().then(function (instance) {
      return instance.transferEtherByDNSName('alien', { from: etherSender, value: web3.toWei(0.1, 'ether') })
        .then(function (result) {
          assert.isNotOk(result.receipt)
        }).catch(function (ex) {
          console.log('asserted that system cannot Transfer funds to non-existing DNSName')
        })
    })
  })

  it('assert that user can bid on a Name', function () {
    let nameOwner = accounts[2]
    let bidderAddress = accounts[3]
    let dnsName = 'Tars'

    return DNSDappMaster.deployed().then(function (instance) {
      return instance.reserveDNSName(dnsName, { from: nameOwner, value: web3.toWei(0.5, 'ether') })
        .then(function (result) {
          return instance.getOwnerName.call(dnsName).then(function (nameOwnerResult) {
            assert.equal(nameOwnerResult, nameOwner, 'able to lookup DNSName Owner as Tars');
          })
            .then(function () {
              return instance.bidForDNSName('Tars', { from: bidderAddress, value: web3.toWei(0.7, 'ether') })
                .then(function (bidResult) {
                  assert.isOk(bidResult.receipt)
                })
            })
        })
    })
  })

  it('assert that user cannot bid on a non-existent Name', function () {
    let bidderAddress = accounts[3]
    let dnsName = 'Endurance'

    return DNSDappMaster.deployed().then(function (instance) {
      return instance.bidForDNSName(dnsName, { from: bidderAddress, value: web3.toWei(0.4, 'ether') })
        .then(function (bidResult) {
          assert.isNotOk(bidResult.receipt)
        }).catch(function (ex) {
          console.log('asserted that user cannot bid on a non-existing DNSName')
        })
    })
  })

  it('assert that user cannot do zero-bidding on an existent Name', function () {
    let bidderAddress = accounts[3]
    let dnsName = 'Tars'

    return DNSDappMaster.deployed().then(function (instance) {
      return instance.bidForDNSName(dnsName, { from: bidderAddress, value: web3.toWei(0, 'ether') })
        .then(function (bidResult) {
          assert.isNotOk(bidResult.receipt)
        }).catch(function (ex) {
          console.log('asserted that user cannot do zero-bidding on a non-existing DNSName')
        })
    })
  })
})
