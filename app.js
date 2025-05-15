const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const channelName = 'mychannel';
const chaincodeName = 'bloodbase';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

let contract;
let gateway;

// Helper function to get connection profile
function buildCCPOrg1() {
    const ccpPath = path.resolve(__dirname, 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    return JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
}

// Helper function to get CA info
function buildCAClient(ccp, caHostName) {
    const caInfo = ccp.certificateAuthorities[caHostName];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
    return caClient;
}

// Build wallet
async function buildWallet(Wallets, walletPath) {
    let wallet;
    if (walletPath) {
        wallet = await Wallets.newFileSystemWallet(walletPath);
    } else {
        wallet = await Wallets.newInMemoryWallet();
    }
    return wallet;
}

// Enroll admin user
async function enrollAdmin() {
    try {
        const ccp = buildCCPOrg1();
        const caClient = buildCAClient(ccp, 'ca.org1.example.com');
        const wallet = await buildWallet(Wallets, walletPath);

        const identity = await wallet.get('admin');
        if (identity) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        const enrollment = await caClient.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: mspOrg1,
            type: 'X.509',
        };
        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
    }
}

// Register and enroll app user
async function registerAndEnrollUser() {
    try {
        const ccp = buildCCPOrg1();
        const caClient = buildCAClient(ccp, 'ca.org1.example.com');
        const wallet = await buildWallet(Wallets, walletPath);

        const userIdentity = await wallet.get(org1UserId);
        if (userIdentity) {
            console.log(`An identity for the user ${org1UserId} already exists in the wallet`);
            return;
        }

        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            throw new Error('Admin identity not found');
        }

        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        const secret = await caClient.register({
            affiliation: 'org1.department1',
            enrollmentID: org1UserId,
            role: 'client'
        }, adminUser);

        const enrollment = await caClient.enroll({
            enrollmentID: org1UserId,
            enrollmentSecret: secret
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: mspOrg1,
            type: 'X.509',
        };
        await wallet.put(org1UserId, x509Identity);
        console.log(`Successfully registered and enrolled user ${org1UserId}`);
    } catch (error) {
        console.error(`Failed to register user ${org1UserId}: ${error}`);
    }
}

// Initialize Fabric connection
async function initializeFabric() {
    try {
        console.log('Building connection profile...');
        const ccp = buildCCPOrg1();
        console.log('Building wallet...');
        const wallet = await buildWallet(Wallets, walletPath);

        // Check for required identities
        const identity = await wallet.get(org1UserId);
        if (!identity) {
            console.error(`User ${org1UserId} not found in wallet`);
            console.log('Run the registerUser.js application before retrying');
            throw new Error(`User ${org1UserId} not found in wallet`);
        }
        console.log(`Found identity for ${org1UserId} in wallet`);

        // Remove any existing gateway instance
        if (gateway) {
            try {
                gateway.disconnect();
                console.log('Disconnected existing gateway');
            } catch (error) {
                console.warn('Failed to disconnect existing gateway:', error.message);
            }
        }

        // Connection options for Gateway - MODIFIED: removed eventHandlerOptions
        const gatewayOptions = {
            wallet,
            identity: org1UserId,
            discovery: { enabled: false, asLocalhost: true }
        };

        // Connect using direct client approach
        console.log('Attempting to connect to fabric network...');
        console.log(`Using identity: ${org1UserId}, channel: ${channelName}, chaincode: ${chaincodeName}`);
        console.log(`Discovery: ${gatewayOptions.discovery.enabled ? "Enabled" : "Disabled"}`);

        console.log('Creating new gateway instance...');
        gateway = new Gateway();

        console.log('Connecting to gateway...');
        await gateway.connect(ccp, gatewayOptions);
        console.log('Connected to gateway successfully');

        console.log(`Getting network for channel ${channelName}...`);
        const network = await gateway.getNetwork(channelName);
        console.log(`Got network for channel ${channelName}`);

        console.log(`Getting contract ${chaincodeName}...`);
        contract = network.getContract(chaincodeName);
        console.log(`Got contract ${chaincodeName}`);

        console.log('Fabric connection initialized successfully');

        // Try a simple query to validate the connection is working
        try {
            console.log('Testing connection with query...');
            const result = await contract.evaluateTransaction('GetAllDonations');
            console.log('Test query successful! Result:', result.toString());
        } catch (queryError) {
            console.warn('Test query failed:', queryError.message);
            console.log('Connection appears to be working, but query failed. This may be normal if the ledger is empty.');
            
            // Try initializing the ledger if not already initialized
            try {
                console.log('Attempting to initialize the ledger...');
        await contract.submitTransaction('InitLedger');
                console.log('Ledger initialized successfully');
            } catch (initError) {
                console.warn('Ledger initialization failed:', initError.message);
                console.log('This may be normal if the ledger is already initialized');
            }
        }

        return true;
    } catch (error) {
        console.error(`Failed to initialize Fabric connection: ${error.message}`);
        console.error(error.stack);
        
        throw error;
    }
}

// Alternative initialization without discovery
async function initializeWithoutDiscovery() {
    try {
        console.log('Attempting connection without discovery service...');
        const ccp = buildCCPOrg1();
        const wallet = await buildWallet(Wallets, walletPath);

        const identity = await wallet.get(org1UserId);
        if (!identity) {
            throw new Error(`User ${org1UserId} not found in wallet`);
        }

        // Remove any existing gateway instance
        if (gateway) {
            try {
                gateway.disconnect();
            } catch (error) {
                console.warn('Failed to disconnect existing gateway:', error.message);
            }
        }

        // Connect using direct approach with no discovery
        gateway = new Gateway();
        await gateway.connect(ccp, { 
            wallet, 
            identity: org1UserId, 
            discovery: { enabled: false, asLocalhost: true } // Explicitly disable discovery
        });
        
        const network = await gateway.getNetwork(channelName);
        contract = network.getContract(chaincodeName);
        
        console.log('Fabric connection initialized successfully without discovery');
        return true;
    } catch (error) {
        console.error(`Failed to initialize without discovery: ${error.message}`);
        throw error;
    }
}

// API Routes

// Initialize Ledger
app.post('/api/init', async (req, res) => {
    try {
        console.log('Attempting to initialize ledger...');
        const result = await contract.submitTransaction('InitLedger');
        console.log('Ledger initialized successfully. Result:', result.toString());
        res.json({ success: true, message: 'Ledger initialized successfully' });
    } catch (error) {
        console.error('Failed to initialize ledger:', error);
        console.error('Error details:', error.endorsements || 'No endorsement details');
        
        // Check if connection is still valid
        try {
            console.log('Testing connection after error...');
            const testResult = await contract.evaluateTransaction('GetAllDonations');
            console.log('Connection is still valid. GetAllDonations returned data of length:', testResult.toString().length);
        } catch (connectionError) {
            console.error('Connection test failed after error:', connectionError.message);
        }
        
        res.status(500).json({ 
            error: error.message,
            details: error.endorsements ? JSON.stringify(error.endorsements) : 'No endorsement details' 
        });
    }
});

// Create Donation
app.post('/api/donations', async (req, res) => {
    try {
        const { id, donorID, bloodType, timestamp } = req.body;
        
        // Validate inputs
        if (!id || !donorID || !bloodType || !timestamp) {
            return res.status(400).json({ error: 'Missing required fields. Need id, donorID, bloodType, and timestamp.' });
        }
        
        console.log(`Creating donation with ID: ${id}, donorID: ${donorID}, bloodType: ${bloodType}, timestamp: ${timestamp}`);
        
        // Log transaction details before submission
        console.log('Transaction details:', {
            function: 'CreateDonation',
            args: [id, donorID, bloodType, timestamp]
        });
        
        // Submit transaction with explicit args to ensure proper format
        const result = await contract.submitTransaction('CreateDonation', id, donorID, bloodType, timestamp);
        console.log('Donation created successfully. Result:', result.toString());
        
        res.json({ success: true, message: 'Donation created successfully' });
    } catch (error) {
        console.error('Failed to create donation:', error);
        console.error('Error details:', error.endorsements || 'No endorsement details');
        console.error('Error cause:', error.cause || 'No cause details');
        res.status(500).json({ 
            error: error.message,
            details: error.endorsements ? JSON.stringify(error.endorsements) : 'No endorsement details'
        });
    }
});

// Read Donation
app.get('/api/donations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Reading donation with ID: ${id}`);
        const result = await contract.evaluateTransaction('ReadDonation', id);
        console.log(`Successfully read donation ${id}`);
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to read donation ${req.params.id}:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// Update Donation Status
app.put('/api/donations/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await contract.submitTransaction('UpdateDonationStatus', id, status);
        res.json({ success: true, message: 'Donation status updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Donation
app.delete('/api/donations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await contract.submitTransaction('DeleteDonation', id);
        res.json({ success: true, message: 'Donation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Donations
app.get('/api/donations', async (req, res) => {
    try {
        console.log('Getting all donations...');
        const result = await contract.evaluateTransaction('GetAllDonations');
        console.log(`Successfully retrieved all donations. Found ${JSON.parse(result.toString()).length} donations`);
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        console.error('Failed to get all donations:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Check Donation Exists
app.get('/api/donations/:id/exists', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await contract.evaluateTransaction('DonationExists', id);
        res.json({ exists: result.toString() === 'true' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Blood Transfer Routes

// Initiate Blood Transfer
app.post('/api/transfers', async (req, res) => {
    try {
        const transferData = JSON.stringify(req.body);
        const result = await contract.submitTransaction('InitiateBloodTransfer', transferData);
        res.json({ success: true, message: 'Blood transfer initiated successfully', transferID: result.toString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Blood Transfer
app.get('/api/transfers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await contract.evaluateTransaction('GetBloodTransfer', id);
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Blood Transfer Status
app.put('/api/transfers/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, actualArrival, temperature } = req.body;
        await contract.submitTransaction('UpdateBloodTransferStatus', id, status, actualArrival || '', temperature || '');
        res.json({ success: true, message: `Blood transfer status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Bloodbase API is running' });
});

// Start server
async function startServer() {
    try {
    console.log('1. Enrolling admin...');
        try {
    await enrollAdmin();
            console.log('Admin enrollment completed successfully');
        } catch (adminError) {
            console.warn('Admin enrollment had an issue:', adminError.message);
            console.log('This may be normal if admin is already enrolled');
        }
    
    console.log('2. Registering user...');
        try {
    await registerAndEnrollUser();
            console.log('User registration completed successfully');
        } catch (userError) {
            console.warn('User registration had an issue:', userError.message);
            console.log('This may be normal if user is already registered');
        }
        
        console.log('3. Initializing Fabric connection...');
        try {
            await initializeFabric();
        } catch (connectionError) {
            console.warn('Standard connection failed, trying without discovery:', connectionError.message);
            await initializeWithoutDiscovery();
        }
        
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Bloodbase API server running on port ${PORT}`);
            console.log('\nAvailable endpoints:');
            console.log('=== GENERAL ===');
            console.log('POST /api/init - Initialize ledger');
            console.log('GET /health - Health check');
            
            console.log('\n=== DONATION MANAGEMENT ===');
            console.log('POST /api/donations - Create donation');
            console.log('GET /api/donations/:id - Read donation');
            console.log('PUT /api/donations/:id/status - Update donation status');
            console.log('DELETE /api/donations/:id - Delete donation');
            console.log('GET /api/donations - Get all donations');
            console.log('GET /api/donations/:id/exists - Check if donation exists');
            
            console.log('\n=== DONOR MANAGEMENT ===');
            console.log('POST /api/donors - Create donor');
            console.log('GET /api/donors/:id - Read donor');
            console.log('PUT /api/donors/:id - Update donor');
            console.log('PUT /api/donors/:id/eligibility - Update donor eligibility');
            console.log('PUT /api/donors/:id/lastDonation - Update donor last donation');
            console.log('DELETE /api/donors/:id - Delete donor');
            console.log('GET /api/donors - Get all donors');
            console.log('GET /api/donors/:id/donations - Get donations by donor');
            console.log('GET /api/donors/eligible - Get eligible donors');
            
            console.log('\n=== APPOINTMENT MANAGEMENT ===');
            console.log('POST /api/appointments - Create appointment');
            console.log('GET /api/appointments/:id - Read appointment');
            console.log('PUT /api/appointments/:id/status - Update appointment status');
            console.log('PUT /api/appointments/:id/reschedule - Reschedule appointment');
            console.log('DELETE /api/appointments/:id - Delete appointment');
            console.log('GET /api/appointments - Get all appointments');
            console.log('GET /api/appointments/user/:userID/:userType - Get appointments by user');
            console.log('GET /api/appointments/date/:date - Get appointments by date');
            console.log('GET /api/appointments/status/:status - Get appointments by status');
            
            console.log('\n=== PATIENT MANAGEMENT ===');
            console.log('POST /api/patients - Create patient');
            console.log('GET /api/patients/:id - Read patient');
            console.log('PUT /api/patients/:id - Update patient');
            console.log('PUT /api/patients/:id/eligibility - Update patient eligibility');
            console.log('POST /api/patients/:id/transfusion - Record transfusion');
            console.log('DELETE /api/patients/:id - Delete patient');
            console.log('GET /api/patients - Get all patients');
            console.log('GET /api/patients/bloodtype/:bloodType - Get patients by blood type');
            console.log('GET /api/patients/:id/compatibleDonations - Get compatible blood donations for patient');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    if (gateway) {
        gateway.disconnect();
    }
    process.exit(0);
});

startServer();