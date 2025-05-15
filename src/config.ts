/*
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'path';

// Channel and chaincode configuration
export const channelName = process.env.CHANNEL_NAME || 'mychannel';
export const chaincodeName = process.env.CHAINCODE_NAME || 'bloodbase';

// MSP configuration
export const mspId = process.env.MSP_ID || 'Org1MSP';

// User identity to use for API operations
export const userId = process.env.FABRIC_USER_ID || 'appUser';

// Wallet configuration
export const walletPath = process.env.WALLET_PATH || 'wallet';

// Connection profile
export const connectionProfilePath = process.env.CONNECTION_PROFILE_PATH || 
    path.join('fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');

// Network configuration
export const asLocalhost = process.env.AS_LOCALHOST ? process.env.AS_LOCALHOST === 'true' : true;

// Server configuration
export const port = process.env.PORT || 3000;
export const host = process.env.HOST || 'localhost';

// Log level
export const logLevel = process.env.LOG_LEVEL || 'info';

// API paths
export const apiPrefix = '/api';
export const apiVersion = '/v1';
export const baseApiPath = apiPrefix + apiVersion;

// Timeouts (in seconds)
export const queryTimeout = Number(process.env.QUERY_TIMEOUT || 120);
export const endorseTimeout = Number(process.env.ENDORSE_TIMEOUT || 120);
export const submitTimeout = Number(process.env.SUBMIT_TIMEOUT || 120);
export const commitTimeout = Number(process.env.COMMIT_TIMEOUT || 600); 