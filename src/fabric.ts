/*
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as config from './config';

/**
 * Load an identity from the wallet directory - supports both old and new wallet formats
 */
export const loadIdentity = async (identityLabel: string): Promise<Identity> => {
    const walletPath = path.join(process.cwd(), config.walletPath);
    
    // Check for new wallet format (direct cert.pem files)
    const newFormatPath = path.join(walletPath, identityLabel);
    const certPath = path.join(newFormatPath, 'cert.pem');
    
    // Check for old wallet format (.id files)
    const oldFormatPath = path.join(walletPath, `${identityLabel}.id`);
    
    try {
        // Try new format first
        if (fs.existsSync(certPath)) {
            console.log(`Loading identity from new format: ${certPath}`);
            const cert = fs.readFileSync(certPath, 'utf8');
            
            return {
                mspId: config.mspId,
                credentials: Buffer.from(cert),
            };
        }
        
        // Try old format if new format doesn't exist
        if (fs.existsSync(oldFormatPath)) {
            console.log(`Loading identity from old wallet format: ${oldFormatPath}`);
            const idData = JSON.parse(fs.readFileSync(oldFormatPath, 'utf8'));
            
            // Print identity data for debugging
            console.log('Identity data structure:', JSON.stringify({
                type: idData.type,
                mspId: idData.mspId,
                hasCertificate: !!idData.credentials?.certificate,
                hasPrivateKey: !!idData.credentials?.privateKey
            }));
            
            // Extract identity from old wallet format
            if (idData.type === 'X.509' && idData.credentials && idData.credentials.certificate) {
                // Always use mspId from config if it's not in the wallet file or to ensure consistency
                const mspId = idData.mspId || config.mspId;
                console.log(`Using MSP ID: ${mspId}`);
                
                return {
                    mspId: mspId,
                    credentials: Buffer.from(idData.credentials.certificate),
                };
            } else {
                throw new Error(`Invalid identity format in ${oldFormatPath}`);
            }
        }
        
        throw new Error(`Identity not found for ${identityLabel} in either format`);
    } catch (error) {
        console.error(`Error loading identity: ${error}`);
        throw new Error(`Failed to load identity for ${identityLabel}: ${error}`);
    }
};

/**
 * Load a private key and create a signer - supports both old and new wallet formats
 */
export const loadSigner = async (identityLabel: string): Promise<Signer> => {
    const walletPath = path.join(process.cwd(), config.walletPath);
    
    // Check for new wallet format
    const newFormatPath = path.join(walletPath, identityLabel);
    const keyPath = path.join(newFormatPath, 'key.pem');
    
    // Check for old wallet format
    const oldFormatPath = path.join(walletPath, `${identityLabel}.id`);
    
    try {
        // Try new format first
        if (fs.existsSync(keyPath)) {
            console.log(`Loading signer from new format: ${keyPath}`);
            const privateKeyPem = fs.readFileSync(keyPath, 'utf8');
            const privateKey = crypto.createPrivateKey(privateKeyPem);
            return signers.newPrivateKeySigner(privateKey);
        }
        
        // Try old format if new format doesn't exist
        if (fs.existsSync(oldFormatPath)) {
            console.log(`Loading signer from old wallet format: ${oldFormatPath}`);
            const idData = JSON.parse(fs.readFileSync(oldFormatPath, 'utf8'));
            
            // Extract private key from old wallet format
            if (idData.type === 'X.509' && idData.credentials && idData.credentials.privateKey) {
                try {
                    // Sanitize private key format - some old wallet formats may not have proper PEM formatting
                    let privateKeyPem = idData.credentials.privateKey;
                    
                    // Check if it has proper PEM header/footer, add if missing
                    if (!privateKeyPem.includes('-----BEGIN PRIVATE KEY-----')) {
                        console.log('Private key is missing PEM header/footer, adding it');
                        privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${privateKeyPem}\n-----END PRIVATE KEY-----`;
                    }
                    
                    console.log('Creating private key from PEM data');
                    const privateKey = crypto.createPrivateKey(privateKeyPem);
                    
                    console.log('Creating signer from private key');
                    return signers.newPrivateKeySigner(privateKey);
                } catch (keyError) {
                    console.error('Error parsing private key:', keyError);
                    throw new Error(`Failed to parse private key: ${keyError}`);
                }
            } else {
                throw new Error(`Invalid identity format or missing private key in ${oldFormatPath}`);
            }
        }
        
        throw new Error(`Signer not found for ${identityLabel} in either format`);
    } catch (error) {
        console.error(`Error loading signer: ${error}`);
        throw new Error(`Failed to load signer for ${identityLabel}: ${error}`);
    }
};

/**
 * Create a gRPC client connection to the Fabric network
 */
export const createGrpcConnection = (): grpc.Client => {
    try {
        const connectionProfile = loadConnectionProfile();
        const peerEndpoint = getPeerEndpoint(connectionProfile);
        
        console.log(`Creating gRPC connection to peer: ${peerEndpoint}`);
        
        // Make sure endpoint doesn't have protocol prefix for gRPC client
        const cleanEndpoint = peerEndpoint.replace(/^(grpcs?:\/\/|dns:)/, '');
        console.log(`Using cleaned endpoint: ${cleanEndpoint}`);
        
        let tlsCredentials;
        try {
            const tlsRootCert = loadTlsRootCert(connectionProfile);
            tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
            console.log('Created TLS credentials for secure connection');
        } catch (tlsError) {
            console.error('Error loading TLS certificate:', tlsError);
            console.warn('SECURITY WARNING: Falling back to insecure connection!');
            tlsCredentials = grpc.credentials.createInsecure();
        }
        
        // Enhanced gRPC options for better network compatibility
        const grpcOptions = {
            'grpc.ssl_target_name_override': getPeerHostname(connectionProfile),
            'grpc.default_authority': getPeerHostname(connectionProfile),
            // Add longer timeouts for better network handling
            'grpc.keepalive_time_ms': 120000,                // 2 min
            'grpc.http2.min_time_between_pings_ms': 120000,  // 2 min
            'grpc.keepalive_timeout_ms': 20000,              // 20 sec
            'grpc.http2.max_pings_without_data': 0,          // Allow unlimited pings
            'grpc.max_receive_message_length': 10 * 1024 * 1024, // 10MB max message size
            'grpc.max_send_message_length': 10 * 1024 * 1024,    // 10MB max message size
            'grpc.enable_retries': 1,                        // Enable retries
            'grpc.service_config': JSON.stringify({
                'methodConfig': [{
                    'name': [{ 'service': 'protos.Gateway' }],
                    'retryPolicy': {
                        'maxAttempts': 5,
                        'initialBackoff': '1s',
                        'maxBackoff': '10s',
                        'backoffMultiplier': 2.0,
                        'retryableStatusCodes': ['UNAVAILABLE', 'DEADLINE_EXCEEDED']
                    }
                }]
            })
        };
        
        // Create client with enhanced options
        const client = new grpc.Client(cleanEndpoint, tlsCredentials, grpcOptions);
        
        console.log('gRPC client connection created successfully');
        return client;
    } catch (error) {
        console.error('Failed to create gRPC connection:', error);
        throw new Error(`Failed to establish gRPC connection: ${error}`);
    }
};

/**
 * Extract peer endpoint from connection profile
 */
const getPeerEndpoint = (connectionProfile: any): string => {
    try {
        // Get the first org's first peer URL from the connection profile
        const orgs = Object.values(connectionProfile.organizations || {});
        if (!orgs.length) {
            throw new Error('No organizations found in connection profile');
        }
        
        const org = orgs[0] as any;
        if (!org.peers || !org.peers.length) {
            throw new Error('No peers found for organization');
        }
        
        const peerId = org.peers[0];
        if (!connectionProfile.peers || !connectionProfile.peers[peerId]) {
            throw new Error(`Peer ${peerId} not found in connection profile`);
        }
        
        const peer = connectionProfile.peers[peerId];
        
        // Use url property for the gRPC endpoint
        if (!peer.url) {
            throw new Error(`No URL defined for peer ${peerId}`);
        }
        
        let grpcUrl = peer.url;
        
        // Ensure URL doesn't have a dns: prefix
        if (grpcUrl.startsWith('dns:')) {
            grpcUrl = grpcUrl.substring(4);
        }
        
        // If running in local development mode with docker, we might need to transform the URL
        if (config.asLocalhost && grpcUrl.includes('localhost')) {
            console.log(`Using local peer URL: ${grpcUrl}`);
            return grpcUrl;
        }
        
        console.log(`Using peer URL: ${grpcUrl}`);
        return grpcUrl;
    } catch (error) {
        console.error('Error extracting peer endpoint:', error);
        
        // Fallback to a default endpoint for development
        const fallbackUrl = 'localhost:7051';
        console.warn(`Using fallback peer endpoint: ${fallbackUrl}`);
        return fallbackUrl;
    }
};

/**
 * Get peer hostname from connection profile for TLS verification
 */
const getPeerHostname = (connectionProfile: any): string => {
    try {
        const orgs = Object.values(connectionProfile.organizations || {});
        if (!orgs.length) {
            return '';
        }
        
        const org = orgs[0] as any;
        if (!org.peers || !org.peers.length) {
            return '';
        }
        
        const peerId = org.peers[0];
        if (!connectionProfile.peers || !connectionProfile.peers[peerId]) {
            return '';
        }
        
        const peer = connectionProfile.peers[peerId];
        
        if (peer.grpcOptions && peer.grpcOptions['ssl-target-name-override']) {
            const hostname = peer.grpcOptions['ssl-target-name-override'];
            console.log(`Using SSL target name override: ${hostname}`);
            return hostname;
        }
        
        // Extract hostname from URL as fallback
        if (peer.url) {
            // Handle different URL formats
            let hostname = '';
            const urlStr = peer.url;
            
            if (urlStr.includes('://')) {
                // Parse standard URL
                try {
                    const url = new URL(urlStr);
                    hostname = url.hostname;
                } catch (e) {
                    // If URL parsing fails, try to extract hostname directly
                    const parts = urlStr.split('://')[1].split(':')[0];
                    hostname = parts;
                }
            } else if (urlStr.includes(':')) {
                // Handle format like "localhost:7051"
                hostname = urlStr.split(':')[0];
            } else {
                hostname = urlStr;
            }
            
            console.log(`Extracted hostname from URL: ${hostname}`);
            return hostname;
        }
        
        return '';
    } catch (error) {
        console.error('Error getting peer hostname:', error);
        return '';
    }
};

/**
 * Load TLS certificate for secure communication with peer
 */
const loadTlsRootCert = (connectionProfile: any): Buffer => {
    const org = Object.values(connectionProfile.organizations)[0] as any;
    const peerId = org.peers[0];
    const peer = connectionProfile.peers[peerId];
    
    // Handle different formats of TLS certificates in connection profiles
    if (peer.tlsCACerts) {
        // Check if the TLS cert is embedded as PEM string directly
        if (peer.tlsCACerts.pem) {
            console.log('Using embedded PEM certificate for TLS');
            return Buffer.from(peer.tlsCACerts.pem);
        }
        
        // Check if there's a path to a certificate file
        if (peer.tlsCACerts.path) {
            console.log(`Loading TLS certificate from path: ${peer.tlsCACerts.path}`);
            const tlsCertPath = path.isAbsolute(peer.tlsCACerts.path)
                ? peer.tlsCACerts.path
                : path.join(process.cwd(), peer.tlsCACerts.path);
            
            return fs.readFileSync(tlsCertPath);
        }
    }
    
    // If we get here, we couldn't find a valid TLS cert - try to find it in the 
    // certificateAuthorities section instead
    if (connectionProfile.certificateAuthorities) {
        const caName = Object.keys(connectionProfile.certificateAuthorities)[0];
        const ca = connectionProfile.certificateAuthorities[caName];
        
        if (ca.tlsCACerts && ca.tlsCACerts.pem) {
            console.log('Using CA TLS certificate for peer connection');
            return Buffer.from(ca.tlsCACerts.pem);
        }
    }
    
    // For development environments, we might allow insecure connections
    console.warn('WARNING: No valid TLS certificate found in connection profile!');
    console.warn('Attempting to proceed with an empty certificate (insecure)');
    return Buffer.from('');
};

/**
 * Load connection profile from filesystem
 */
export const loadConnectionProfile = (): any => {
    const ccpPath = path.resolve(process.cwd(), config.connectionProfilePath);
    console.log(`Loading connection profile from: ${ccpPath}`);
    
    if (!fs.existsSync(ccpPath)) {
        console.error(`Connection profile not found at ${ccpPath}`);
        console.error('Checking for alternative locations...');
        
        // Try some alternative locations that might exist
        const alternativePaths = [
            path.join(process.cwd(), 'connection-org1.json'),
            path.join(process.cwd(), 'connection.json'),
            path.join(process.cwd(), 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json')
        ];
        
        for (const altPath of alternativePaths) {
            console.log(`Checking alternative path: ${altPath}`);
            if (fs.existsSync(altPath)) {
                console.log(`Found alternative connection profile at: ${altPath}`);
                const fileContents = fs.readFileSync(altPath, 'utf8');
                return JSON.parse(fileContents);
            }
        }
        
        throw new Error(`Connection profile not found at ${ccpPath} or any alternative locations`);
    }
    
    try {
        const fileContents = fs.readFileSync(ccpPath, 'utf8');
        const connectionProfile = JSON.parse(fileContents);
        
        // Validate the connection profile has required structure
        if (!connectionProfile.organizations) {
            console.warn('Connection profile missing organizations section');
        }
        if (!connectionProfile.peers) {
            console.warn('Connection profile missing peers section');
        }
        
        return connectionProfile;
    } catch (error) {
        console.error(`Error loading connection profile: ${error}`);
        throw new Error(`Failed to load connection profile from ${ccpPath}: ${error}`);
    }
};

/**
 * Initialize the connection to the Fabric network and return a contract
 */
export const initFabric = async (): Promise<Contract> => {
    try {
        // Create gRPC connection
        console.log('Creating gRPC connection...');
        const client = createGrpcConnection();
        
        // Try to load user identity and check for issues
        console.log(`Checking for identity: ${config.userId}`);
        const walletPath = path.join(process.cwd(), config.walletPath);
        const newFormatPath = path.join(walletPath, config.userId);
        const oldFormatPath = path.join(walletPath, `${config.userId}.id`);
        
        // Print diagnostic info about wallet files
        console.log('Wallet diagnostic information:');
        console.log(`- Wallet directory exists: ${fs.existsSync(walletPath)}`);
        console.log(`- New format directory exists: ${fs.existsSync(newFormatPath)}`);
        if (fs.existsSync(newFormatPath)) {
            const certExists = fs.existsSync(path.join(newFormatPath, 'cert.pem'));
            const keyExists = fs.existsSync(path.join(newFormatPath, 'key.pem'));
            console.log(`  - Certificate exists: ${certExists}`);
            console.log(`  - Private key exists: ${keyExists}`);
        }
        console.log(`- Old format file exists: ${fs.existsSync(oldFormatPath)}`);
        
        // If old wallet format exists, print more details about it
        if (fs.existsSync(oldFormatPath)) {
            try {
                const idData = JSON.parse(fs.readFileSync(oldFormatPath, 'utf8'));
                console.log(`- Old format identity type: ${idData.type}`);
                console.log(`- Old format MSP ID: ${idData.mspId || 'NOT SET'}`);
                console.log(`- Has certificate: ${!!idData.credentials?.certificate}`);
                console.log(`- Has private key: ${!!idData.credentials?.privateKey}`);
            } catch (error) {
                console.warn(`- Could not read old format wallet: ${error}`);
            }
        }
        
        // Load identity and signer
        try {
            console.log(`Loading identity for ${config.userId}...`);
            const identity = await loadIdentity(config.userId);
            console.log(`Loading signer for ${config.userId}...`);
            const signer = await loadSigner(config.userId);
            
            // Set deadlines for various operations
            const currentDate = Date.now();
            const queryTimeout = currentDate + (config.queryTimeout * 1000);
            const endorseTimeout = currentDate + (config.endorseTimeout * 1000);
            const submitTimeout = currentDate + (config.submitTimeout * 1000);
            const commitTimeout = currentDate + (config.commitTimeout * 1000);
            
            // Connect to gateway with more robust options
            console.log('Connecting to Fabric gateway...');
            const gateway = await connect({
                client,
                identity,
                signer,
                // Use proper options by specifying the full call options object 
                evaluateOptions: () => {
                    return { 
                        deadline: queryTimeout,
                        waitForReady: true,
                    };
                },
                endorseOptions: () => {
                    return { 
                        deadline: endorseTimeout,
                        waitForReady: true,
                    };
                },
                submitOptions: () => {
                    return { 
                        deadline: submitTimeout,
                        waitForReady: true,
                    };
                },
                commitStatusOptions: () => {
                    return { 
                        deadline: commitTimeout,
                        waitForReady: true,
                    };
                },
            });
            
            console.log('Connected to Fabric gateway');
            
            // Get network and contract
            console.log(`Getting network: ${config.channelName}`);
            const network = gateway.getNetwork(config.channelName);
            
            console.log(`Getting contract: ${config.chaincodeName}`);
            const contract = network.getContract(config.chaincodeName);
            
            console.log(`Connected to network: ${config.channelName}, contract: ${config.chaincodeName}`);
            
            // Add cleanup on process exit
            process.on('SIGTERM', () => {
                console.log('Closing gateway connection');
                gateway.close();
                client.close();
            });
            
            process.on('SIGINT', () => {
                console.log('Closing gateway connection');
                gateway.close();
                client.close();
            });
            
            // Try to query the ledger as a test
            console.log('Testing connection with query...');
            try {
                const result = await contract.evaluateTransaction('GetAllDonations');
                console.log('Test query successful!');
                if (result.length > 0) {
                    console.log(`Found ${JSON.parse(Buffer.from(result).toString()).length} donations on the ledger`);
                } else {
                    console.log('Ledger appears to be empty, no donations found');
                }
            } catch (queryError: unknown) {
                const errMsg = queryError instanceof Error ? queryError.message : String(queryError);
                console.warn(`Test query failed: ${errMsg}`);

                // Check for specific errors
                if (errMsg.includes('creator org unknown') || errMsg.includes('access denied')) {
                    console.error('ERROR: Identity validation failed. The certificate or MSP ID may be incorrect.');
                    console.log('Creating a new identity may resolve this issue.');
                } else {
                    console.log('Connection appears to be working, but query failed. This may be normal if the ledger is empty.');
                    
                    // Try initializing the ledger if not already initialized
                    try {
                        console.log('Attempting to initialize the ledger...');
                        await contract.submitTransaction('InitLedger');
                        console.log('Ledger initialized successfully');
                    } catch (initError: unknown) {
                        const initErrMsg = initError instanceof Error ? initError.message : String(initError);
                        console.warn(`Ledger initialization failed: ${initErrMsg}`);
                        console.log('This may be normal if the ledger is already initialized or if InitLedger function does not exist');
                    }
                }
            }
            
            return contract;
        } catch (identityError) {
            console.error('Failed to load identity or connect to gateway:', identityError);
            
            if (!fs.existsSync(oldFormatPath) && !fs.existsSync(newFormatPath)) {
                console.error('\nERROR: User identity not found in wallet.');
                console.error(`Neither ${config.userId}.id nor ${config.userId}/cert.pem exists.`);
                console.error('\nTo fix this issue:');
                console.error('1. Run enrollAdmin.ts to create admin credentials');
                console.error('2. Run registerUser.ts to create user credentials');
                console.error('\nTry running: npm run enroll-admin && npm run register-user');
            } else if (fs.existsSync(oldFormatPath)) {
                try {
                    // Try to provide diagnostic info about the old format identity
                    const idContent = JSON.parse(fs.readFileSync(oldFormatPath, 'utf8'));
                    console.error('\nFound old format identity file but couldn\'t use it.');
                    console.error(`- Has certificate: ${!!idContent?.credentials?.certificate}`);
                    console.error(`- Has private key: ${!!idContent?.credentials?.privateKey}`);
                    console.error(`- MSP ID: ${idContent?.mspId || 'Not found'}`);
                } catch (readError) {
                    console.error(`Error reading identity file: ${readError}`);
                }
            }
            
            throw new Error(`Failed to initialize Fabric connection: ${identityError}`);
        }
    } catch (error) {
        console.error('Failed to initialize Fabric connection:', error);
        throw error;
    }
};

/**
 * Evaluate a transaction (query)
 */
export const evaluateTransaction = async (
    contract: Contract,
    transactionName: string,
    ...transactionArgs: string[]
): Promise<Uint8Array> => {
    console.log(`Evaluating transaction: ${transactionName}`);
    
    try {
        const result = await contract.evaluateTransaction(transactionName, ...transactionArgs);
        console.log(`Transaction ${transactionName} evaluated successfully`);
        return result;
    } catch (error) {
        console.error(`Error evaluating transaction ${transactionName}:`, error);
        throw error;
    }
};

/**
 * Submit a transaction (update)
 */
export const submitTransaction = async (
    contract: Contract,
    transactionName: string,
    ...transactionArgs: string[]
): Promise<Uint8Array> => {
    console.log(`Submitting transaction: ${transactionName}`);
    
    try {
        const result = await contract.submitTransaction(transactionName, ...transactionArgs);
        console.log(`Transaction ${transactionName} submitted successfully`);
        return result;
    } catch (error) {
        console.error(`Error submitting transaction ${transactionName}:`, error);
        throw error;
    }
}; 