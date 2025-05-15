#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# API URL
API_URL="http://localhost:3000/api"

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

# Generate unique IDs for test resources
DONOR_ID="donor-$(date +%s)"
DONATION_ID="donation-$(date +%s)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

header "API TESTING SCRIPT"

info "Using the following test IDs:"
echo "DONOR_ID: $DONOR_ID"
echo "DONATION_ID: $DONATION_ID"
echo "TIMESTAMP: $TIMESTAMP"
echo ""

# Test health endpoint
info "Testing health endpoint..."
curl -s "$API_URL/health" | jq .
echo ""

# Initialize the ledger
info "Initializing the ledger..."
curl -s -X POST "$API_URL/init" | jq .
echo ""

# Create a donor
info "Creating a donor..."
curl -s -X POST "$API_URL/donors" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$DONOR_ID\",
    \"name\": \"John Doe\",
    \"cnic\": \"12345-1234567-1\",
    \"bloodType\": \"A+\",
    \"phone\": \"+923001122334\",
    \"email\": \"john@example.com\",
    \"address\": \"123 Main St\",
    \"dateOfBirth\": \"1990-01-01\",
    \"registrationDate\": \"$TIMESTAMP\"
  }" | jq .
echo ""

# Get the donor
info "Getting the donor..."
curl -s "$API_URL/donors/$DONOR_ID" | jq .
echo ""

# Create a donation
info "Creating a donation..."
curl -s -X POST "$API_URL/donations" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$DONATION_ID\",
    \"donorID\": \"$DONOR_ID\",
    \"bloodType\": \"A+\",
    \"timestamp\": \"$TIMESTAMP\"
  }" | jq .
echo ""

# Get the donation
info "Getting the donation..."
curl -s "$API_URL/donations/$DONATION_ID" | jq .
echo ""

# Get all donations
info "Getting all donations..."
curl -s "$API_URL/donations" | jq .
echo ""

# Check if donation exists
info "Checking if donation exists..."
curl -s "$API_URL/donations/$DONATION_ID/exists" | jq .
echo ""

header "TESTING COMPLETE" 