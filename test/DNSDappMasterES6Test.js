/* eslint-disable max-len,padded-blocks */
const DNSDappMaster = artifacts.require('DNSDappMaster')

contract('tests DNSDapp functions of DNSDappMaster contract', async () => {
  it('should be deployed to the test chain', deployToTestChain)
  it('assert that non-existent name check returns false', testNonExistentDNSName)
  it('assert that dnsName name can be successfully reserved', testReserveDNSName)
  it('assert that dnsName exists in System', testExistentDNSName)
})

async function deployToTestChain () {

  const dNSDappMaster = await DNSDappMaster.deployed()

  assert.isNotNull(dNSDappMaster)
}

async function testNonExistentDNSName () {

  const dNSDappMaster = await DNSDappMaster.deployed()

  assert.isNotNull(dNSDappMaster)

  const fakeDNSName = 'alien'

  const actual = await dNSDappMaster.isAValidDNSNameString(fakeDNSName)

  assert.isFalse(actual)
}

async function testReserveDNSName () {

  const dNSDappMaster = await DNSDappMaster.deployed()

  assert.isNotNull(dNSDappMaster)

  const dnsName = 'cosmos'

  const nameOwner = web3.eth.accounts[1]

  const isReservationSuccessful = await dNSDappMaster.reserveDNSName.call(dnsName, { from: nameOwner, value: web3.toWei(1, 'ether') })

  assert.isTrue(isReservationSuccessful)
}

async function testExistentDNSName () {

  const dNSDappMaster = await DNSDappMaster.deployed()

  assert.isNotNull(dNSDappMaster)

  const dnsName = 'cosmos1'

  const nameOwner = web3.eth.accounts[2]

  const isReservationSuccessful = await dNSDappMaster.reserveDNSName.call(dnsName, { from: nameOwner, value: web3.toWei(0.1, 'ether') })

  assert.isTrue(isReservationSuccessful)

  const isReservationSuccessful1 = await dNSDappMaster.reserveDNSName.call(dnsName, { from: nameOwner, value: web3.toWei(0.1, 'ether') })

  assert.isTrue(isReservationSuccessful1)
}
