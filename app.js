const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

const channelName = 'mychannel';
const chaincodeName = 'bloodbase';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

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
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
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
        console.log(`Successfully registered and enrolled admin user ${org1UserId} and imported it into the wallet`);
    } catch (error) {
        console.error(`Failed to register user ${org1UserId}: ${error}`);
    }
}

// Main application logic
async function main() {
    try {
        // Build connection profile and wallet
        const ccp = buildCCPOrg1();
        const wallet = await buildWallet(Wallets, walletPath);

        // Check if user identity exists
        const identity = await wallet.get(org1UserId);
        if (!identity) {
            console.log(`An identity for the user ${org1UserId} does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: org1UserId, discovery: { enabled: true, asLocalhost: true } });

        // Get the network and contract
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        // Initialize ledger (only run once)
        console.log('\n--> Submit Transaction: InitLedger');
        await contract.submitTransaction('InitLedger');
        console.log('*** Result: committed');

        // Create a new donation
        console.log('\n--> Submit Transaction: CreateDonation');
        await contract.submitTransaction('CreateDonation', 'donation4', 'donor4', 'B+', '2025-05-14T12:00:00Z');
        console.log('*** Result: committed');

        // Read a donation
        console.log('\n--> Evaluate Transaction: ReadDonation');
        let result = await contract.evaluateTransaction('ReadDonation', 'donation4');
        console.log(`*** Result: ${result.toString()}`);

        // Update donation status
        console.log('\n--> Submit Transaction: UpdateDonationStatus');
        await contract.submitTransaction('UpdateDonationStatus', 'donation4', 'used');
        console.log('*** Result: committed');

        // Read the updated donation
        console.log('\n--> Evaluate Transaction: ReadDonation');
        result = await contract.evaluateTransaction('ReadDonation', 'donation4');
        console.log(`*** Result: ${result.toString()}`);

        // Get all donations
        console.log('\n--> Evaluate Transaction: GetAllDonations');
        result = await contract.evaluateTransaction('GetAllDonations');
        console.log(`*** Result: ${result.toString()}`);

        // Disconnect from the gateway
        gateway.disconnect();

    } catch (error) {
        console.error(`Failed to run application: ${error}`);
    }
}

// Initialize the application
async function initApplication() {
    console.log('1. Enrolling admin...');
    await enrollAdmin();
    
    console.log('2. Registering user...');
    await registerAndEnrollUser();
    
    console.log('3. Running main application...');
    await main();
}

initApplication(); 