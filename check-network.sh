#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Print header
header() {
  echo -e "${BLUE}===============================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}===============================================${NC}"
}

# Print info
info() {
  echo -e "${YELLOW}INFO: $1${NC}"
}

# Print success
success() {
  echo -e "${GREEN}SUCCESS: $1${NC}"
}

# Print error
error() {
  echo -e "${RED}ERROR: $1${NC}"
}

# Navigate to test network directory
cd fabric-samples/test-network

# Setup environment variables
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

header "CHECKING NETWORK STATUS"

# Check if network is up
info "Checking if peer0.org1 is responding..."
if peer channel list > /dev/null 2>&1; then
  success "Peer0.org1 is up and responding."
  
  # List the channels
  info "Channels joined by peer0.org1:"
  peer channel list
else
  error "Peer0.org1 is not responding."
  exit 1
fi

header "CHECKING CHAINCODE STATUS"

# Check installed chaincodes
info "Checking installed chaincodes..."
peer lifecycle chaincode queryinstalled

# Check committed chaincodes on mychannel
info "Checking committed chaincodes on mychannel..."
peer lifecycle chaincode querycommitted --channelID mychannel

# Try to query the chaincode
header "TRYING TO QUERY THE CHAINCODE"

info "Trying to query all donations..."
peer chaincode query -C mychannel -n bloodbase -c '{"Args":["GetAllDonations"]}' || {
  error "Failed to query GetAllDonations"
}

info "Trying to initialize the ledger..."
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n bloodbase --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}' || {
  error "Failed to initialize ledger"
}

# Check chaincode policy
header "CHECKING CHAINCODE ENDORSEMENT POLICY"

info "Checking endorsement policy for bloodbase chaincode..."
POLICY=$(peer lifecycle chaincode querycommitted -C mychannel -n bloodbase --output json 2>/dev/null | jq -r '.endorsement_plugin')

if [[ "$POLICY" == "null" ]]; then
  info "Using default endorsement policy: implicit meta policy requiring signatures from a majority of organizations"
else
  info "Custom endorsement policy: $POLICY"
fi

header "CHAINCODE DIAGNOSTIC COMPLETE"

cd ../../
echo "Return to original directory: $(pwd)" 