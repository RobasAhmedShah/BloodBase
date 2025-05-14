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
        const ccp = buildCCPOrg1();
        const wallet = await buildWallet(Wallets, walletPath);

        const identity = await wallet.get(org1UserId);
        if (!identity) {
            throw new Error(`User ${org1UserId} not found in wallet`);
        }

        gateway = new Gateway();
        await gateway.connect(ccp, { 
            wallet, 
            identity: org1UserId, 
            discovery: { enabled: true, asLocalhost: true }
        });

        const network = await gateway.getNetwork(channelName);
        contract = network.getContract(chaincodeName);
        
        console.log('Fabric connection initialized successfully');
    } catch (error) {
        console.error(`Failed to initialize Fabric connection: ${error}`);
        throw error;
    }
}

// API Routes

// Initialize Ledger
app.post('/api/init', async (req, res) => {
    try {
        await contract.submitTransaction('InitLedger');
        res.json({ success: true, message: 'Ledger initialized successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Donation
app.post('/api/donations', async (req, res) => {
    try {
        const { id, donorID, bloodType, timestamp } = req.body;
        await contract.submitTransaction('CreateDonation', id, donorID, bloodType, timestamp);
        res.json({ success: true, message: 'Donation created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read Donation
app.get('/api/donations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await contract.evaluateTransaction('ReadDonation', id);
        res.json(JSON.parse(result.toString()));
    } catch (error) {
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
        const result = await contract.evaluateTransaction('GetAllDonations');
        res.json(JSON.parse(result.toString()));
    } catch (error) {
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

// Get Blood Transfers by Blood Bank
app.get('/api/bloodbanks/:id/transfers', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.query;
        const result = await contract.evaluateTransaction('GetBloodTransfersByBloodBank', id, status || '');
        res.json(JSON.parse(result.toString()));
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
        await enrollAdmin();
        
        console.log('2. Registering user...');
        await registerAndEnrollUser();
        
        console.log('3. Initializing Fabric connection...');
        await initializeFabric();
        
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Bloodbase API server running on port ${PORT}`);
            console.log('\nAvailable endpoints:');
            console.log('POST /api/init - Initialize ledger');
            console.log('POST /api/donations - Create donation');
            console.log('GET /api/donations/:id - Read donation');
            console.log('PUT /api/donations/:id/status - Update donation status');
            console.log('DELETE /api/donations/:id - Delete donation');
            console.log('GET /api/donations - Get all donations');
            console.log('GET /api/donations/:id/exists - Check if donation exists');
            console.log('POST /api/transfers - Initiate blood transfer');
            console.log('GET /api/transfers/:id - Get blood transfer details');
            console.log('PUT /api/transfers/:id/status - Update blood transfer status');
            console.log('GET /api/bloodbanks/:id/transfers - Get blood transfers by blood bank');
            console.log('GET /health - Health check');
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