#!/bin/bash

# Exit on first error
set -e

# Define color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Print colored messages
info() {
    echo -e "${YELLOW}INFO: $1${NC}"
}

success() {
    echo -e "${GREEN}SUCCESS: $1${NC}"
}

error() {
    echo -e "${RED}ERROR: $1${NC}"
    exit 1
}

header() {
    echo -e "${BLUE}===============================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===============================================================${NC}"
}

# Check if network is running
header "Checking if Fabric network is running"
cd fabric-samples/test-network

# Check if peer command is available
if ! command -v peer &> /dev/null; then
    info "Setting Fabric environment variables..."
    export PATH=${PWD}/../bin:$PATH
    export FABRIC_CFG_PATH=${PWD}/configtx
fi

# Set environment variables for the peer CLI
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# Check if peer 0 is responding
info "Checking if peer0.org1 is running..."
if peer channel list &> /dev/null; then
    success "Fabric network is running"
else
    error "Fabric network is not running. Please start the network with './network.sh up createChannel' and deploy the chaincode with './network.sh deployCC -ccn bloodbase -ccp ../bloodbase/chaincode-typescript -ccl typescript'"
fi

# Check if the chaincode is deployed
info "Checking if bloodbase chaincode is deployed..."
if peer lifecycle chaincode queryinstalled | grep -q "bloodbase"; then
    success "Bloodbase chaincode is installed"
else
    error "Bloodbase chaincode is not installed. Please deploy the chaincode with './network.sh deployCC -ccn bloodbase -ccp ../bloodbase/chaincode-typescript -ccl typescript'"
fi

cd ../..

# Install nodejs dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    header "Installing Node.js dependencies"
    npm install
fi

# Run the diagnostic script
header "Running diagnostics"
node check-wallet.js

# Start the application
header "Starting BloodBase API"
npm start 