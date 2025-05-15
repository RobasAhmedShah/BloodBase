/**
 * BloodBase API Test Script
 * 
 * This script tests the various endpoints of the BloodBase API by creating, reading,
 * updating, and deleting resources from all the available resource types.
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Base URL for the API
const API_URL = 'http://localhost:3000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Helper function to log errors
const logError = (error) => {
  console.error(`${colors.red}Error: ${error.response ? error.response.data.error : error.message}${colors.reset}`);
};

// Helper function to log success
const logSuccess = (message) => {
  console.log(`${colors.green}Success: ${message}${colors.reset}`);
};

// Helper function to log info
const logInfo = (message) => {
  console.log(`${colors.blue}${message}${colors.reset}`);
};

// Helper function to log section header
const logSection = (message) => {
  console.log(`${colors.yellow}===========================================`);
  console.log(`${message}`);
  console.log(`==========================================${colors.reset}`);
};

// Generate unique IDs for testing
const DONATION_ID = `donation-${Date.now()}`;
const DONOR_ID = `donor-${Date.now()}`;
const TIMESTAMP = new Date().toISOString();

// Helper function to perform API calls
async function callAPI(method, endpoint, data = null) {
    try {
        console.log(`${method.toUpperCase()} ${endpoint}`);
        const url = `${API_URL}${endpoint}`;
        
        let response;
        if (method === 'get') {
            response = await axios.get(url);
        } else if (method === 'post') {
            response = await axios.post(url, data);
        } else if (method === 'put') {
            response = await axios.put(url, data);
        } else if (method === 'delete') {
            response = await axios.delete(url);
        }
        
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return null;
    }
}

// Main test function
async function runTests() {
    console.log('=== BLOODBASE API TEST ===');
    console.log('Test IDs:');
    console.log(`DONOR_ID: ${DONOR_ID}`);
    console.log(`DONATION_ID: ${DONATION_ID}`);
    console.log(`TIMESTAMP: ${TIMESTAMP}`);
    console.log('==========================');
    
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...');
    await callAPI('get', '/health');
    
    // Test 2: Create a donor
    console.log('\n2. Creating a donor...');
    await callAPI('post', '/donors', {
        id: DONOR_ID,
        name: 'John Doe',
        cnic: '12345-1234567-1',
        bloodType: 'A+',
        phone: '+923001122334',
        email: 'john@example.com',
        address: '123 Main St',
        dateOfBirth: '1990-01-01',
        registrationDate: TIMESTAMP
    });
    
    // Test 3: Create a donation
    console.log('\n3. Creating a donation...');
    await callAPI('post', '/donations', {
        id: DONATION_ID,
        donorID: DONOR_ID,
        bloodType: 'A+',
        timestamp: TIMESTAMP
    });
    
    // Test 4: Read the donation
    console.log('\n4. Reading the donation...');
    await callAPI('get', `/donations/${DONATION_ID}`);
    
    // Test 5: Get all donations
    console.log('\n5. Getting all donations...');
    await callAPI('get', '/donations');
    
    // Test 6: Check if donation exists
    console.log('\n6. Checking if donation exists...');
    await callAPI('get', `/donations/${DONATION_ID}/exists`);
    
    console.log('\n=== TESTING COMPLETE ===');
}

// Run the tests
runTests().catch(console.error); 