#!/bin/bash

# Set path to the test-network directory
cd /mnt/d/bloodbase/fabric-samples/test-network

# Build the chaincode first
echo "Building chaincode..."
cd ../../bloodbase/chaincode-typescript
npm install
npm run build
cd ../../fabric-samples/test-network

# Get the next sequence number by checking committed chaincode
echo "Checking current sequence number..."
CURRENT_SEQUENCE=$(peer lifecycle chaincode querycommitted --channelID mychannel --name bloodbase --output json 2>/dev/null | jq -r '.sequence // 0')
NEXT_SEQUENCE=$((CURRENT_SEQUENCE + 1))
echo "Using sequence number: $NEXT_SEQUENCE"

# Package the chaincode
echo "Packaging chaincode..."
peer lifecycle chaincode package bloodbase.tar.gz --path ../../bloodbase/chaincode-typescript/ --lang node --label bloodbase_1.0

# Set environment variables
export CORE_PEER_TLS_ENABLED=true

# Install on Org1
echo "Installing chaincode on Org1..."
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode install bloodbase.tar.gz

# Install on Org2
echo "Installing chaincode on Org2..."
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp 
export CORE_PEER_ADDRESS=localhost:9051

peer lifecycle chaincode install bloodbase.tar.gz

# Get the package ID
echo "Getting package ID..."
CC_PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[] | select(.label=="bloodbase_1.0") | .package_id' | head -1)
echo "Package ID: $CC_PACKAGE_ID"

# Approve for Org2
echo "Approving chaincode for Org2..."
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name bloodbase --version 1.0 --package-id $CC_PACKAGE_ID --sequence $NEXT_SEQUENCE --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

# Switch back to Org1
echo "Approving chaincode for Org1..."
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name bloodbase --version 1.0 --package-id $CC_PACKAGE_ID --sequence $NEXT_SEQUENCE --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

# Commit the chaincode definition
echo "Committing chaincode definition..."
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name bloodbase --version 1.0 --sequence $NEXT_SEQUENCE --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"

echo "Chaincode deployment completed successfully!"

# Verify the deployment
echo "Verifying deployment..."
peer lifecycle chaincode querycommitted --channelID mychannel --name bloodbase

# Test the chaincode
echo "Testing chaincode..."
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n bloodbase --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"CreateDonation","Args":["donation3","12345","A+","2025-05-14T06:44:00Z"]}' 