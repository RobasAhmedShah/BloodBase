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

header "DIRECT CLI TESTING"

# Generate unique IDs for test resources
DONOR_ID="donor-$(date +%s)"
DONATION_ID="donation-$(date +%s)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

info "Using the following test IDs:"
echo "DONOR_ID: $DONOR_ID"
echo "DONATION_ID: $DONATION_ID"
echo "TIMESTAMP: $TIMESTAMP"
echo ""

# Initialize the ledger
info "Initializing the ledger..."
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n bloodbase --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}' || {
  error "Failed to initialize ledger"
}
success "Ledger initialized"
sleep 2

# Create a new donor
info "Creating a new donor..."
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n bloodbase --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" -c "{\"function\":\"CreateDonor\",\"Args\":[\"$DONOR_ID\", \"John Doe\", \"12345-1234567-1\", \"A+\", \"+923001122334\", \"john@example.com\", \"123 Main St\", \"1990-01-01\", \"$TIMESTAMP\"]}" || {
  error "Failed to create donor"
}
success "Donor created with ID: $DONOR_ID"
sleep 2

# Query the donor
info "Querying donor..."
peer chaincode query -C mychannel -n bloodbase -c "{\"function\":\"ReadDonor\",\"Args\":[\"$DONOR_ID\"]}" || {
  error "Failed to query donor"
}
success "Donor queried successfully"
sleep 2

# Create a new donation
info "Creating a new donation..."
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n bloodbase --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" -c "{\"function\":\"CreateDonation\",\"Args\":[\"$DONATION_ID\", \"$DONOR_ID\", \"A+\", \"$TIMESTAMP\"]}" || {
  error "Failed to create donation"
}
success "Donation created with ID: $DONATION_ID"
sleep 2

# Query the donation
info "Querying donation..."
peer chaincode query -C mychannel -n bloodbase -c "{\"function\":\"ReadDonation\",\"Args\":[\"$DONATION_ID\"]}" || {
  error "Failed to query donation"
}
success "Donation queried successfully"
sleep 2

# Get all donations
info "Getting all donations..."
peer chaincode query -C mychannel -n bloodbase -c '{"function":"GetAllDonations","Args":[]}' || {
  error "Failed to get all donations"
}
success "All donations retrieved successfully"

header "TESTING COMPLETE"

cd ../../
echo "Return to original directory: $(pwd)" 