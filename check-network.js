const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

// Configuration
const channelName = 'mychannel';
const chaincodeName = 'bloodbase';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

// Helper function to get connection profile
function buildCCPOrg1() {
    const ccpPath = path.resolve(__dirname, 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    console.log(`Loading connection profile from: ${ccpPath}`);
    if (!fs.existsSync(ccpPath)) {
        console.error(`Connection profile not found at ${ccpPath}`);
        return null;
    }
    const fileContents = fs.readFileSync(ccpPath, 'utf8');
    return JSON.parse(fileContents);
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

async function main() {
    let gateway;

    try {
        // Step 1: Check if the connection profile exists
        console.log('\n===== STEP 1: Checking Connection Profile =====');
        const ccp = buildCCPOrg1();
        if (!ccp) {
            throw new Error('Connection profile not found');
        }
        console.log('Connection profile loaded successfully');
        console.log('Organizations:', Object.keys(ccp.organizations));
        console.log('Certificate Authorities:', Object.keys(ccp.certificateAuthorities));
        console.log('Peers:', Object.keys(ccp.peers));

        // Step 2: Check wallet and identities
        console.log('\n===== STEP 2: Checking Wallet =====');
        const wallet = await buildWallet(Wallets, walletPath);
        console.log(`Wallet path: ${walletPath}`);
        
        const identities = await wallet.list();
        console.log(`Found ${identities.length} identities in wallet:`, identities);
        
        // Check if admin identity exists
        const adminIdentity = await wallet.get('admin');
        if (adminIdentity) {
            console.log('Admin identity found in wallet');
        } else {
            console.warn('Admin identity not found in wallet');
        }
        
        // Check if application user identity exists
        const userIdentity = await wallet.get(org1UserId);
        if (userIdentity) {
            console.log(`User identity ${org1UserId} found in wallet`);
        } else {
            console.warn(`User identity ${org1UserId} not found in wallet`);
            throw new Error(`User identity ${org1UserId} not found in wallet. Please enroll user first.`);
        }

        // Step 3: Test connection to gateway
        console.log('\n===== STEP 3: Testing Gateway Connection =====');
        
        // Connection options - try without unnecessary options
        const gatewayOptions = {
            wallet,
            identity: org1UserId,
            discovery: { enabled: false, asLocalhost: true }
        };
        
        console.log('Gateway connection options:', JSON.stringify(gatewayOptions, null, 2));
        
        // Try to connect
        console.log('Connecting to gateway...');
        gateway = new Gateway();
        await gateway.connect(ccp, gatewayOptions);
        console.log('Successfully connected to gateway');
        
        // Step 4: Test access to channel
        console.log(`\n===== STEP 4: Testing Channel Access (${channelName}) =====`);
        const network = await gateway.getNetwork(channelName);
        console.log(`Successfully connected to channel: ${channelName}`);
        
        // Step 5: Test access to chaincode
        console.log(`\n===== STEP 5: Testing Chaincode Access (${chaincodeName}) =====`);
        const contract = network.getContract(chaincodeName);
        console.log(`Successfully got contract: ${chaincodeName}`);
        
        // Step 6: Test query operation
        console.log('\n===== STEP 6: Testing Query Operation =====');
        try {
            console.log('Querying GetAllDonations function...');
            const result = await contract.evaluateTransaction('GetAllDonations');
            
            const resultStr = result.toString();
            const donations = JSON.parse(resultStr);
            
            console.log(`Success! Retrieved ${donations.length} donations.`);
            console.log('First 2 donations (sample):', JSON.stringify(donations.slice(0, 2), null, 2));
        } catch (queryError) {
            console.error('Query failed:', queryError.message);
            throw queryError;
        }
        
        console.log('\n===== DIAGNOSTICS COMPLETE: ALL TESTS PASSED =====');
        console.log('Your Hyperledger Fabric network and chaincode are working correctly');
        
    } catch (error) {
        console.error('\n===== ERROR =====');
        console.error(`Diagnostic check failed: ${error.message}`);
        console.error(error.stack);
    } finally {
        // Disconnect from the gateway
        if (gateway) {
            console.log('\nDisconnecting from gateway...');
            gateway.disconnect();
        }
    }
}

// Run the main function
main(); 