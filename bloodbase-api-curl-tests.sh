#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Base URL for the API
API_URL="http://localhost:3000/api"

# Helper functions
print_header() {
  echo -e "${YELLOW}===================================================${NC}"
  echo -e "${YELLOW}$1${NC}"
  echo -e "${YELLOW}===================================================${NC}"
}

print_info() {
  echo -e "${BLUE}$1${NC}"
}

print_success() {
  echo -e "${GREEN}SUCCESS: $1${NC}"
}

print_error() {
  echo -e "${RED}ERROR: $1${NC}"
}

# Generate unique IDs for test resources
DONOR_ID="donor-$(date +%s)"
DONATION_ID="donation-$(date +%s)"
APPOINTMENT_ID="appointment-$(date +%s)"
PATIENT_ID="patient-$(date +%s)"

echo "Using the following test IDs:"
echo "DONOR_ID: $DONOR_ID"
echo "DONATION_ID: $DONATION_ID"
echo "APPOINTMENT_ID: $APPOINTMENT_ID"
echo "PATIENT_ID: $PATIENT_ID"
echo ""

# ================================================
# Initialize the ledger
# ================================================
print_header "INITIALIZING LEDGER"
print_info "Initializing the ledger with sample data..."

curl -X POST "$API_URL/init" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# ================================================
# Test Donor Management
# ================================================
print_header "TESTING DONOR MANAGEMENT"

# Create a new donor
print_info "Creating a new donor..."
curl -X POST "$API_URL/donors" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$DONOR_ID\", 
    \"name\": \"John Donor\", 
    \"cnic\": \"12345-6789012-3\", 
    \"bloodType\": \"A+\", 
    \"phone\": \"+923001122334\", 
    \"email\": \"john.donor@example.com\", 
    \"address\": \"123 Main St, City\", 
    \"dateOfBirth\": \"1990-01-15\"
  }" \
  -s | jq .

sleep 1

# Read the donor
print_info "Reading the donor..."
curl -X GET "$API_URL/donors/$DONOR_ID" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# Update donor eligibility
print_info "Updating donor eligibility..."
curl -X PUT "$API_URL/donors/$DONOR_ID/eligibility" \
  -H "Content-Type: application/json" \
  -d "{
    \"eligibilityStatus\": \"eligible\"
  }" \
  -s | jq .

sleep 1

# Read the updated donor
print_info "Reading updated donor..."
curl -X GET "$API_URL/donors/$DONOR_ID" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# Get all donors
print_info "Getting all donors..."
curl -X GET "$API_URL/donors" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# ================================================
# Test Donation Management
# ================================================
print_header "TESTING DONATION MANAGEMENT"

# Create a new donation
print_info "Creating a new donation..."
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
curl -X POST "$API_URL/donations" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$DONATION_ID\", 
    \"donorID\": \"$DONOR_ID\", 
    \"bloodType\": \"A+\", 
    \"timestamp\": \"$TIMESTAMP\"
  }" \
  -s | jq .

sleep 1

# Read the donation
print_info "Reading the donation..."
curl -X GET "$API_URL/donations/$DONATION_ID" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# Update donation status
print_info "Updating donation status..."
curl -X PUT "$API_URL/donations/$DONATION_ID/status" \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"tested\"
  }" \
  -s | jq .

sleep 1

# Read the updated donation
print_info "Reading updated donation..."
curl -X GET "$API_URL/donations/$DONATION_ID" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# Get all donations
print_info "Getting all donations..."
curl -X GET "$API_URL/donations" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# Update donor's last donation
print_info "Updating donor's last donation date..."
DONATION_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
curl -X PUT "$API_URL/donors/$DONOR_ID/lastDonation" \
  -H "Content-Type: application/json" \
  -d "{
    \"donationDate\": \"$DONATION_DATE\"
  }" \
  -s | jq .

sleep 1

# ================================================
# Test Appointment Management
# ================================================
print_header "TESTING APPOINTMENT MANAGEMENT"

# Create a new appointment
print_info "Creating a new appointment..."
curl -X POST "$API_URL/appointments" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$APPOINTMENT_ID\", 
    \"userID\": \"$DONOR_ID\", 
    \"userType\": \"donor\", 
    \"bloodBankID\": \"bloodbank1\", 
    \"appointmentDate\": \"2023-08-20\", 
    \"appointmentTime\": \"10:00\", 
    \"purpose\": \"donation\", 
    \"notes\": \"Regular donation appointment\"
  }" \
  -s | jq .

sleep 1

# Read the appointment
print_info "Reading the appointment..."
curl -X GET "$API_URL/appointments/$APPOINTMENT_ID" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# Update appointment status
print_info "Updating appointment status..."
curl -X PUT "$API_URL/appointments/$APPOINTMENT_ID/status" \
  -H "Content-Type: application/json" \
  -d "{
    \"newStatus\": \"completed\"
  }" \
  -s | jq .

sleep 1

# Read the updated appointment
print_info "Reading updated appointment..."
curl -X GET "$API_URL/appointments/$APPOINTMENT_ID" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# Get appointments by user
print_info "Getting appointments by user..."
curl -X GET "$API_URL/appointments/user/$DONOR_ID/donor" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# Get appointments by date
print_info "Getting appointments by date..."
curl -X GET "$API_URL/appointments/date/2023-08-20" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# Get appointments by status
print_info "Getting appointments by status..."
curl -X GET "$API_URL/appointments/status/completed" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# ================================================
# Test Patient Management
# ================================================
print_header "TESTING PATIENT MANAGEMENT"

# Create a new patient
print_info "Creating a new patient..."
curl -X POST "$API_URL/patients" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$PATIENT_ID\", 
    \"name\": \"Jane Patient\", 
    \"cnic\": \"98765-4321098-7\", 
    \"bloodType\": \"B-\", 
    \"phone\": \"+923009988776\", 
    \"email\": \"jane.patient@example.com\", 
    \"address\": \"456 Oak St, City\", 
    \"dateOfBirth\": \"1985-05-22\", 
    \"medicalHistory\": \"Thalassemia\", 
    \"doctorPrescription\": \"Monthly transfusion required\"
  }" \
  -s | jq .

sleep 1

# Read the patient
print_info "Reading the patient..."
curl -X GET "$API_URL/patients/$PATIENT_ID" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# Update patient eligibility
print_info "Updating patient eligibility..."
curl -X PUT "$API_URL/patients/$PATIENT_ID/eligibility" \
  -H "Content-Type: application/json" \
  -d "{
    \"eligibilityStatus\": \"eligible\"
  }" \
  -s | jq .

sleep 1

# Read the updated patient
print_info "Reading updated patient..."
curl -X GET "$API_URL/patients/$PATIENT_ID" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# Record transfusion
print_info "Recording transfusion..."
curl -X POST "$API_URL/patients/$PATIENT_ID/transfusion" \
  -H "Content-Type: application/json" \
  -d "{
    \"donationID\": \"$DONATION_ID\"
  }" \
  -s | jq .

sleep 1

# Get all patients
print_info "Getting all patients..."
curl -X GET "$API_URL/patients" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# Get patients by blood type
print_info "Getting patients by blood type..."
curl -X GET "$API_URL/patients/bloodtype/B-" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# Get compatible blood donations for patient
print_info "Getting compatible blood donations for patient..."
curl -X GET "$API_URL/patients/$PATIENT_ID/compatibleDonations" \
  -H "Content-Type: application/json" \
  -s | jq .

sleep 1

# ================================================
# Final Summary
# ================================================
print_header "TEST SUMMARY"
echo "Test resources created:"
echo "Donor ID: $DONOR_ID"
echo "Donation ID: $DONATION_ID"
echo "Appointment ID: $APPOINTMENT_ID"
echo "Patient ID: $PATIENT_ID"
echo ""
print_success "All API tests completed." 