/**
 * Check wallet identities
 */
const { Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

// Configuration
const walletPath = path.join(__dirname, 'wallet');
const connectionProfilePath = path.resolve(__dirname, 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');

async function main() {
    try {
        console.log(`Checking wallet at: ${walletPath}`);
        
        // Check if wallet directory exists
        if (!fs.existsSync(walletPath)) {
            console.error(`Wallet directory does not exist at ${walletPath}`);
            return;
        }
        
        // Get the wallet
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        
        // List all identities
        const identities = await wallet.list();
        console.log(identities);
        
        // Check admin identity
        if (identities.includes('admin')) {
            const identity = await wallet.get('admin');
            console.log('Admin identity details:');
            console.log(`Type: ${identity.type}`);
            console.log(`MspId: ${identity.mspId}`);
            console.log(`Has credentials: ${identity.credentials.certificate ? 'Yes' : 'No'}`);
            console.log();
        } else {
            console.log('Admin identity not found in wallet.');
            console.log();
        }
        
        // Check appUser identity
        if (identities.includes('appUser')) {
            const identity = await wallet.get('appUser');
            console.log('AppUser identity details:');
            console.log(`Type: ${identity.type}`);
            console.log(`MspId: ${identity.mspId}`);
            console.log(`Has credentials: ${identity.credentials.certificate ? 'Yes' : 'No'}`);
            console.log();
        } else {
            console.log('AppUser identity not found in wallet.');
            console.log();
        }
        
        // Check connection profile
        console.log(`Connection profile at ${connectionProfilePath}: ${fs.existsSync(connectionProfilePath) ? 'Exists' : 'Not found'}`);
        
        if (fs.existsSync(connectionProfilePath)) {
            const profile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));
            console.log('Connection profile loaded successfully');
            console.log('Organizations:', Object.keys(profile.organizations));
            console.log('Certificate Authorities:', Object.keys(profile.certificateAuthorities));
        }
        
        console.log('Done checking wallet');
        
    } catch (error) {
        console.error(`Error checking wallet: ${error.message}`);
        console.error(error.stack);
    }
}

main(); 