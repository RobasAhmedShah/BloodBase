/*
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import * as config from './config';
import { initFabric, evaluateTransaction } from './fabric';

/**
 * Simple test to verify wallet setup, connection profile, and network connectivity
 */
async function main() {
    try {
        console.log('=== BloodBase API Connection Test ===');
        
        // Check connection profile
        const ccpPath = path.resolve(process.cwd(), config.connectionProfilePath);
        console.log(`Connection profile path: ${ccpPath}`);
        
        if (!fs.existsSync(ccpPath)) {
            console.error(`Error: Connection profile not found at ${ccpPath}`);
            process.exit(1);
        }
        
        console.log('Connection profile exists - OK');
        
        // Check wallet and identities
        const walletPath = path.join(process.cwd(), config.walletPath);
        console.log(`Wallet path: ${walletPath}`);
        
        if (!fs.existsSync(walletPath)) {
            console.log(`Note: Wallet directory does not exist yet at ${walletPath}`);
            console.log('It will be created when you run enrollAdmin.ts');
            process.exit(1);
        }
        
        // Check for identity files
        const userPath = path.join(walletPath, config.userId);
        const certPath = path.join(userPath, 'cert.pem');
        const keyPath = path.join(userPath, 'key.pem');
        
        if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
            console.log(`User identity '${config.userId}' exists - OK`);
        } else {
            console.log(`User identity '${config.userId}' incomplete or not found - you should run enrollAdmin.ts and registerUser.ts`);
            process.exit(1);
        }
        
        console.log('\nEnvironment Configuration:');
        console.log(`- Channel Name: ${config.channelName}`);
        console.log(`- Chaincode Name: ${config.chaincodeName}`);
        console.log(`- MSP ID: ${config.mspId}`);
        console.log(`- User ID: ${config.userId}`);
        console.log(`- API Port: ${config.port}`);
        
        // Test actual connection to the network
        console.log('\nAttempting connection to Fabric network...');
        
        try {
            // Initialize fabric connection
            const contract = await initFabric();
            console.log('Successfully connected to Fabric network - OK');
            
            // Try a simple query to verify chaincode access
            console.log('\nTesting chaincode access...');
            try {
                // This assumes a GetAllDonations function exists in the chaincode
                const result = await evaluateTransaction(contract, 'GetAllDonations');
                console.log('Successfully queried chaincode - OK');
                
                // Display first few characters of the result to verify data
                const resultString = Buffer.from(result).toString();
                console.log(`Query result preview: ${resultString.substring(0, 100)}${resultString.length > 100 ? '...' : ''}`);
            } catch (ccError: any) {
                console.error('Failed to query chaincode:', ccError?.message || 'Unknown error');
                console.log('This might be normal if the GetAllDonations function is not implemented in your chaincode');
            }
        } catch (connError: any) {
            console.error('Failed to connect to Fabric network:', connError?.message || 'Unknown error');
            console.error('Please check your connection profile, network status, and identity credentials');
            process.exit(1);
        }
        
        console.log('\n=== Test Complete ===');
        
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

main(); 