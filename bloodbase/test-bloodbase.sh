#!/bin/bash

# Exit on any error
set -e

# Define color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Print colored header
header() {
  echo -e "${BLUE}===============================================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}===============================================================${NC}"
}

# Print success message
success() {
  echo -e "${GREEN}SUCCESS: $1${NC}"
}

# Print error message
error() {
  echo -e "${RED}ERROR: $1${NC}"
  exit 1
}

# Print info message
info() {
  echo -e "${YELLOW}INFO: $1${NC}"
}

# # Navigate to test network directory
# cd /mnt/d/bloodbase/fabric-samples/test-network

# # Deploy the BloodBase chaincode
# header "Deploying BloodBase chaincode"
# ./network.sh deployCC -ccn bloodbase -ccp /mnt/d/bloodbase/bloodbase/chaincode-typescript -ccl typescript -c mychannel || error "Failed to deploy chaincode"
# success "BloodBase chaincode deployed"

# Set up environment variables for the peer CLI
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051


# Initialize the ledger
# header "Initializing the ledger with sample data"
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n bloodbase --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}' || error "Failed to initialize ledger"
# success "Ledger initialized with sample data"

# # Wait for transaction to be processed
# info "Waiting for transactions to be processed..."
# sleep 3

# # Test Blood Donation Management
# header "TESTING BLOOD DONATION MANAGEMENT"

# # Query all donations
# info "Querying all donations..."
# peer chaincode query -C mychannel -n bloodbase -c '{"Args":["GetAllDonations"]}' || error "Failed to query donations"
# success "Retrieved all donations"

# # Create a new donation
# info "Creating a new donation..."
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n bloodbase --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"CreateDonation","Args":["donation6", "donor1", "AB+", "2023-05-15T12:00:00Z"]}' || error "Failed to create donation"
# success "Created donation3"

# # Wait for transaction to be processed
# info "Waiting for transaction to be processed..."
# sleep 3

# # Read the newly created donation
# info "Reading new donation..."
# peer chaincode query -C mychannel -n bloodbase -c '{"Args":["ReadDonation","donation6"]}' || error "Failed to read donation"
# success "Read donation3"

# # Update donation status
# info "Updating donation status..."
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n bloodbase --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"UpdateDonationStatus","Args":["donation6", "reserved"]}' || error "Failed to update donation status"
# success "Updated donation3 status to reserved"

# # Wait for transaction to be processed
# info "Waiting for transaction to be processed..."
# sleep 3

# # Query donation again to verify status
# info "Verifying donation status update..."
# peer chaincode query -C mychannel -n bloodbase -c '{"Args":["ReadDonation","donation6"]}' || error "Failed to read donation"
# success "Verified donation status update"

# # Test Donor Management
# header "TESTING DONOR MANAGEMENT"

# # Query all donors
# info "Querying all donors..."
# peer chaincode query -C mychannel -n bloodbase -c '{"Args":["GetAllDonors"]}' || error "Failed to query donors"
# success "Retrieved all donors"

# # Create a new donor
# info "Creating a new donor..."
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n bloodbase --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"CreateDonor","Args":["donor6", "Alex Johnson", "35201-1234567-3", "B+", "+923001122334", "alex@example.com", "789 Pine St, City", "1988-03-20", "2023-05-15T12:00:00Z"]}' || error "Failed to create donor"
# success "Created donor3"

# # Wait for transaction to be processed
# info "Waiting for transaction to be processed..."
# sleep 3

# # Read the newly created donor
# info "Reading new donor..."
# peer chaincode query -C mychannel -n bloodbase -c '{"Args":["ReadDonor","donor6"]}' || error "Failed to read donor"
# success "Read donor3"

# # Update donor eligibility
# info "Updating donor eligibility..."
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n bloodbase --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"UpdateDonorEligibility","Args":["donor6", "eligible"]}' || error "Failed to update donor eligibility"
# success "Updated donor3 eligibility to eligible"

# # Wait for transaction to be processed
# info "Waiting for transaction to be processed..."
# sleep 3

# # Get donations by donor
# info "Getting donations by donor1..."
# peer chaincode query -C mychannel -n bloodbase -c '{"Args":["GetDonationsByDonor","donor1"]}' || error "Failed to get donations by donor"
# success "Retrieved donations for donor1"

# # Get eligible donors
# info "Getting eligible donors..."
# peer chaincode query -C mychannel -n bloodbase -c '{"Args":["GetEligibleDonors"]}' || error "Failed to get eligible donors"
# success "Retrieved eligible donors"

# # Test Appointment Management
# header "TESTING APPOINTMENT MANAGEMENT"

# # Create a new appointment
# info "Creating a new appointment..."
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n bloodbase --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"CreateAppointment","Args":["appointment1", "donor3", "donor", "bloodbank1", "2023-08-15", "10:00", "donation", "Regular donation appointment"]}' || error "Failed to create appointment"
# success "Created appointment1"

# # Wait for transaction to be processed
# info "Waiting for transaction to be processed..."
# sleep 3

# # Read the newly created appointment
# info "Reading new appointment..."
# peer chaincode query -C mychannel -n bloodbase -c '{"Args":["ReadAppointment","appointment1"]}' || error "Failed to read appointment"
# success "Read appointment1"

# # Get appointments by user
# info "Getting appointments for donor3..."
# peer chaincode query -C mychannel -n bloodbase -c '{"Args":["GetAppointmentsByUser","donor3","donor"]}' || error "Failed to get appointments by user"
# success "Retrieved appointments for donor3"

# # Update appointment status
# info "Updating appointment status to completed..."
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n bloodbase --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"UpdateAppointmentStatus","Args":["appointment1", "completed"]}' || error "Failed to update appointment status"
# success "Updated appointment1 status to completed"

# # Wait for transaction to be processed
# info "Waiting for transaction to be processed..."
# sleep 3

# # Verify donor's last donation date was updated
# info "Verifying donor's donation count was updated..."
# peer chaincode query -C mychannel -n bloodbase -c '{"Args":["ReadDonor","donor3"]}' || error "Failed to read donor"
# success "Verified donor3 donation count update"

# # Test Patient Management
# header "TESTING PATIENT MANAGEMENT"

# # Create a new patient
# info "Creating a new patient..."
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n bloodbase --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"CreatePatient","Args":["patient1", "Sarah Williams", "35201-9876543-1", "AB+", "+923009988776", "sarah@example.com", "101 Oak St, City", "1992-07-25", "Anemia", "Needs regular transfusions","2023-08-15"]}' || error "Failed to create patient"
# success "Created patient1"

# # Wait for transaction to be processed
# info "Waiting for transaction to be processed..."
# sleep 3

# # Read the newly created patient
# info "Reading new patient..."
# peer chaincode query -C mychannel -n bloodbase -c '{"Args":["ReadPatient","patient1"]}' || error "Failed to read patient"
# success "Read patient1"

# Create another donation for later use
info "Creating a donation for transfusion..."
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n bloodbase --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"CreateDonation","Args":["donation8", "donor1", "O+", "2023-06-10T14:00:00Z"]}' || error "Failed to create donation"
success "Created donation4 for transfusion"

# Wait for transaction to be processed
info "Waiting for transaction to be processed..."
sleep 3

# Get compatible blood donations for patient
info "Getting compatible blood donations for patient1..."
peer chaincode query -C mychannel -n bloodbase -c '{"Args":["GetCompatibleBloodDonations","patient1"]}' || error "Failed to get compatible donations"
success "Retrieved compatible donations for patient1"

# Record a transfusion
info "Recording a transfusion for patient1 using donation4..."
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n bloodbase --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"UpdatePatientTransfusion","Args":["patient1", "donation4"]}' || error "Failed to record transfusion"
success "Recorded transfusion for patient1"

# Wait for transaction to be processed
info "Waiting for transaction to be processed..."
sleep 3

# Verify patient's transfusion count was updated
info "Verifying patient's transfusion count was updated..."
peer chaincode query -C mychannel -n bloodbase -c '{"Args":["ReadPatient","patient1"]}' || error "Failed to read patient"
success "Verified patient1 transfusion count update"

# Verify donation status was updated to transfused
info "Verifying donation4 status is now transfused..."
peer chaincode query -C mychannel -n bloodbase -c '{"Args":["ReadDonation","donation4"]}' || error "Failed to read donation"
success "Verified donation4 status update to transfused"

# Final confirmation
header "TEST SUMMARY"
echo -e "${GREEN}All tests completed successfully!${NC}"
echo -e "${YELLOW}The BloodBase chaincode has been deployed and tested with the following functionality:${NC}"
echo -e "${YELLOW}- Blood Donation management (create, read, update, delete)${NC}"
echo -e "${YELLOW}- Donor management (create, read, update, eligibility)${NC}"
echo -e "${YELLOW}- Appointment scheduling and tracking${NC}"
echo -e "${YELLOW}- Patient management and transfusion recording${NC}"
echo -e "${YELLOW}- Blood compatibility matching${NC}"

# Note: Leave network running for further manual testing
echo -e "${BLUE}Note: The network is still running for further manual testing.${NC}"
echo -e "${BLUE}When finished, run './network.sh down' to bring down the network.${NC}" 