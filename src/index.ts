/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Contract } from '@hyperledger/fabric-gateway';
import * as config from './config';
import { initFabric } from './fabric';
import { createServer } from './server';

/**
 * Main application entry point
 */
async function main() {
    let contract: Contract | undefined;
    
    try {
        console.log('Starting BloodBase API server...');
        
        // Connect to Fabric network
        console.log('Connecting to Fabric network...');
        contract = await initFabric();
        console.log('Successfully connected to Fabric network');
        
        // Create and configure Express server
        console.log('Creating REST server...');
        const app = await createServer();
        
        // Store contract in app locals for use in routes
        app.locals.contract = contract;
        
        // Start server
        app.listen(config.port, () => {
            console.log(`BloodBase API server started on ${config.host}:${config.port}`);
            console.log(`Health endpoint: http://${config.host}:${config.port}/health`);
            console.log(`API Base URL: http://${config.host}:${config.port}${config.baseApiPath}`);
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    process.exit(0);
});

// Start the application
main().catch(err => {
    console.error('Unhandled error in main application:', err);
    process.exit(1);
}); 