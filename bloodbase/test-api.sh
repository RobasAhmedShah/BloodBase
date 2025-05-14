#!/bin/bash

# Set path to the test-network directory
cd /mnt/d/bloodbase/fabric-samples/test-network

# Set environment variables for Org1
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# Common variables
ORDERER_CA="${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
PEER1_TLS="${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
PEER2_TLS="${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"

# Function to invoke chaincode
invoke_chaincode() {
    FUNCTION=$1
    ARGS=$2
    echo "Invoking $FUNCTION with args: $ARGS"
    
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls --cafile "${ORDERER_CA}" \
        -C mychannel -n bloodbase \
        --peerAddresses localhost:7051 --tlsRootCertFiles "${PEER1_TLS}" \
        -c "{\"function\":\"$FUNCTION\",\"Args\":[$ARGS]}"
    
    echo "------------------------------"
    sleep 2
}

# Function to query chaincode
query_chaincode() {
    echo "Querying function: $1"
    peer chaincode query -C mychannel -n bloodbase -c "$2"
    echo ""
    sleep 1
}

echo "=== Test 1: Initialize the Ledger ==="
invoke_chaincode "InitLedger" ""

echo "=== Test 2: Get All Donations ==="
invoke_chaincode "GetAllDonations" ""

echo "=== Test 3: Read Donation 1 ==="
invoke_chaincode "ReadDonation" "\"donation1\""

echo "=== Test 4: Create a New Donation ==="
invoke_chaincode "CreateDonation" "\"donation3\", \"donor3\", \"B+\", \"2025-05-15T12:00:00Z\""

echo "=== Test 5: Read the New Donation ==="
invoke_chaincode "ReadDonation" "\"donation3\""

echo "=== Test 6: Update Donation Status ==="
invoke_chaincode "UpdateDonationStatus" "\"donation1\", \"used\""

echo "=== Test 7: Verify Status Update ==="
invoke_chaincode "ReadDonation" "\"donation1\""

echo "=== Test 8: Get All Donations (After Updates) ==="
invoke_chaincode "GetAllDonations" ""

echo "=== Test 9: Delete a Donation ==="
invoke_chaincode "DeleteDonation" "\"donation2\""

echo "=== Test 10: Verify Deletion ==="
invoke_chaincode "GetAllDonations" ""

echo "=== Test 11: Try to Read Deleted Donation (Should Fail) ==="
invoke_chaincode "ReadDonation" "\"donation2\""

echo "All tests completed!"