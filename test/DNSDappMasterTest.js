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
        .then(function (transactionResult) {
          assert.isOk(transactionResult.receipt)
          return instance.isAValidDNSNameString.call('lakshmikanth.p').then(function (reservationEvent) {
            assert.equal(reservationEvent, true, 'lakshmikanth.p is now reserved')
          })
        }).then(function () {
          return instance.reserveDNSName('lakshmikanth.p', { from: nameOwner, value: web3.toWei(1, 'ether') })
            .then(function (transactionResult) {
              assert.isNotOk(transactionResult.receipt)
            }).catch(function (exception) {
              console.log('asserted that system cannot reserve an existing DNSName')
            })
        })
    })
  })

  it('assert that system can Reserve a new DNSName', function () {
    let nameOwner = accounts[1]
    return DNSDappMaster.deployed().then(function (instance) {
      return instance.reserveDNSName('lakshmikanth.pabbisetti', { from: nameOwner, value: web3.toWei(1, 'ether') })
        .then(function (transactionResult) {
          assert.isOk(transactionResult.receipt)
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
        .then(function (transactionResult) {
          assert.isOk(transactionResult.receipt)
          return instance.isAValidDNSNameString.call('lakshmikanth').then(function (reservationEvent) {
            assert.equal(reservationEvent, true, 'lakshmikanth is now reserved')
          })
        })
        .then(function () {
          return instance.transferEtherByDNSName('lakshmikanth', { from: etherSender, value: web3.toWei(0.1, 'ether') })
            .then(function (transactionResult) {
              assert.isOk(transactionResult.receipt)
            })
        })
    })
  })

  it('assert that system cannot Transfer funds to non-existing DNSName', function () {
    let etherSender = accounts[2]
    return DNSDappMaster.deployed().then(function (instance) {
      return instance.transferEtherByDNSName('alien', { from: etherSender, value: web3.toWei(0.1, 'ether') })
        .then(function (transactionResult) {
          assert.isNotOk(transactionResult.receipt)
        }).catch(function (exception) {
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
        .then(function (transactionResult) {
          return instance.getOwnerName.call(dnsName).then(function (nameOwnertransactionResult) {
            assert.equal(nameOwnertransactionResult, nameOwner, 'able to lookup DNSName Owner as Tars');
          })
            .then(function () {
              return instance.bidForDNSName('Tars', { from: bidderAddress, value: web3.toWei(0.7, 'ether') })
                .then(function (bidtransactionResult) {
                  assert.isOk(bidtransactionResult.receipt)
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
        .then(function (bidtransactionResult) {
          assert.isNotOk(bidtransactionResult.receipt)
        }).catch(function (exception) {
          console.log('asserted that user cannot bid on a non-existing DNSName')
        })
    })
  })

  it('assert that user cannot do zero-bidding on an existent DNSName', function () {
    let bidderAddress = accounts[3]
    let dnsName = 'Tars'

    return DNSDappMaster.deployed().then(function (instance) {
      return instance.bidForDNSName(dnsName, { from: bidderAddress, value: web3.toWei(0, 'ether') })
        .then(function (bidtransactionResult) {
          assert.isNotOk(bidtransactionResult.receipt)
        }).catch(function (exception) {
          console.log('asserted that user cannot do zero-bidding on a non-existing DNSName')
        })
    })
  })

  it('assert scenario of multiple users bidding on a DNSName', function () {
    let dnsName = 'Murphy'
    let dnsNameOwner = accounts[2]
    let firstBidder = accounts[3]
    let secondBidder = accounts[4]
    let thirdBidder = accounts[5]
    return DNSDappMaster.deployed().then(function (instance) {
      return instance.reserveDNSName(dnsName, { from: dnsNameOwner, value: web3.toWei(0.4, 'ether') })
        .then(function (transactionResult) {
          return instance.getOwnerName.call(dnsName).then(function (owner) {
            assert.equal(owner, dnsNameOwner, 'Murphy is now reserved')
          })
            .then(function () {
              return instance.bidForDNSName(dnsName, { from: firstBidder, value: web3.toWei(0.5, 'ether') })
                .then(function (transactionResult) {
                  assert.isOk(transactionResult.receipt)
                })
            }).then(function () {
              return instance.bidForDNSName(dnsName, { from: secondBidder, value: web3.toWei(0.45, 'ether') })
                .then(function (transactionResult) {
                  assert.isNotOk(transactionResult.receipt)
                }).catch(function (exception) {
                  console.log('reject currentBidder as currentBidPrice is lesser than indicativePrice' + exception)
                })
            }).then(function () {
              return instance.bidForDNSName(dnsName, { from: thirdBidder, value: web3.toWei(0.75, 'ether') })
                .then(function (transactionResult) {
                  assert.isOk(transactionResult.receipt)
                })
            })
        })
    })
  })

  it('assert the bid-Finalizing process', function () {
    let dnsName = 'Tesseract'
    let dnsNameOwner = accounts[2]
    let firstBidder = accounts[3]
    let secondBidder = accounts[4]
    let thirdBidder = accounts[5]
    return DNSDappMaster.deployed().then(function (instance) {
      return instance.reserveDNSName(dnsName, { from: dnsNameOwner, value: web3.toWei(0.4, 'ether') })
        .then(function (transactionResult) {
          return instance.getOwnerName.call(dnsName).then(function (owner) {
            assert.equal(owner, dnsNameOwner, 'Tesseract is now reserved')
          })
            .then(function () {
              return instance.bidForDNSName(dnsName, { from: firstBidder, value: web3.toWei(0.5, 'ether') })
                .then(function (transactionResult) {
                  assert.isOk(transactionResult.receipt)
                })
            }).then(function () {
              return instance.bidForDNSName(dnsName, { from: secondBidder, value: web3.toWei(0.45, 'ether') })
                .then(function (transactionResult) {
                  assert.isNotOk(transactionResult.receipt)
                }).catch(function (exception) {
                  console.log('reject currentBidder as currentBidPrice is lesser than indicativePrice' + exception)
                })
            }).then(function () {
              return instance.bidForDNSName(dnsName, { from: thirdBidder, value: web3.toWei(0.75, 'ether') })
                .then(function (transactionResult) {
                  assert.isOk(transactionResult.receipt)
                })
            }).then(function () {
              return instance.finalizeBiddingProcess(dnsName, { from: dnsNameOwner })
                .then(function (result) {
                  assert.isOk(result.receipt);
                })
            })
            .then(function () {
              return instance.getOwnerName.call(dnsName).then(function (winningBidder) {
                assert.equal(winningBidder, thirdBidder, 'thirdBidder is the new owner of Tesseract')
              })
            })
        })
    })
  })

  it('assert that dnsNameOwner can release ownership', function () {
    let dnsName = 'Apollo'
    let dnsNameOwner = accounts[2]

    return DNSDappMaster.deployed().then(function (instance) {
      return instance.reserveDNSName(dnsName, { from: dnsNameOwner, value: web3.toWei(0.4, 'ether') })
        .then(function (transactionResult) {
          return instance.getOwnerName.call(dnsName).then(function (owner) {
            assert.equal(owner, dnsNameOwner, 'Apollo is now reserved')
          }).then(function () {
            return instance.releaseDNSNameOwnership.call(dnsName, { from: dnsNameOwner }).then(function (releaseOwnershipResult) {
              assert.equal(releaseOwnershipResult, true, 'ownership released successfully')
            })
          })
        })
    })
  })

  it('assert that dnsNameOwner cannot be released by non-owning entity', function () {
    let dnsName = 'OptimusPrime'
    let dnsNameOwner = accounts[2]
    let fakeOwner = 'Kaiju'

    return DNSDappMaster.deployed().then(function (instance) {
      return instance.reserveDNSName(dnsName, { from: dnsNameOwner, value: web3.toWei(0.4, 'ether') })
        .then(function (transactionResult) {
          return instance.getOwnerName.call(dnsName).then(function (owner) {
            assert.equal(owner, dnsNameOwner, 'Apollo is now reserved')
          }).then(function () {
            return instance.releaseDNSNameOwnership.call(dnsName, { from: fakeOwner }).then(function (releaseOwnershipResult) {
              assert.isNotOk(releaseOwnershipResult.receipt)
            }).catch(function (exception) {
              console.log('failed-attempt of release-ownership by fakeOwner: ' + fakeOwner)
            })
          })
        })
    })
  })

})
