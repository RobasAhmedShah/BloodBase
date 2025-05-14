const path = require('path');

module.exports = {
    channelName: 'mychannel',
    chaincodeName: 'basic',
    mspId: 'Org1MSP',
    cryptoPath: '/mnt/d/blood/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com',
    keyDirectoryPath: '/mnt/d/blood/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore',
    certDirectoryPath: '/mnt/d/blood/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts',
    tlsCertPath: '/mnt/d/blood/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt',
    peerEndpoint: 'localhost:7051',
    peerHostAlias: 'peer0.org1.example.com'
}; 