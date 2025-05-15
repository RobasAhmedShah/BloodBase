"use strict";
/*
 * SPDX-License-Identifier: Apache-2.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitTransaction = exports.evaluateTransaction = exports.initFabric = exports.loadConnectionProfile = exports.createGrpcConnection = exports.loadSigner = exports.loadIdentity = void 0;
const grpc = __importStar(require("@grpc/grpc-js"));
const fabric_gateway_1 = require("@hyperledger/fabric-gateway");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config = __importStar(require("./config"));
/**
 * Load an identity from the wallet directory - supports both old and new wallet formats
 */
const loadIdentity = async (identityLabel) => {
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
            }
            else {
                throw new Error(`Invalid identity format in ${oldFormatPath}`);
            }
        }
        throw new Error(`Identity not found for ${identityLabel} in either format`);
    }
    catch (error) {
        console.error(`Error loading identity: ${error}`);
        throw new Error(`Failed to load identity for ${identityLabel}: ${error}`);
    }
};
exports.loadIdentity = loadIdentity;
/**
 * Load a private key and create a signer - supports both old and new wallet formats
 */
const loadSigner = async (identityLabel) => {
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
            return fabric_gateway_1.signers.newPrivateKeySigner(privateKey);
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
                    return fabric_gateway_1.signers.newPrivateKeySigner(privateKey);
                }
                catch (keyError) {
                    console.error('Error parsing private key:', keyError);
                    throw new Error(`Failed to parse private key: ${keyError}`);
                }
            }
            else {
                throw new Error(`Invalid identity format or missing private key in ${oldFormatPath}`);
            }
        }
        throw new Error(`Signer not found for ${identityLabel} in either format`);
    }
    catch (error) {
        console.error(`Error loading signer: ${error}`);
        throw new Error(`Failed to load signer for ${identityLabel}: ${error}`);
    }
};
exports.loadSigner = loadSigner;
/**
 * Create a gRPC client connection to the Fabric network
 */
const createGrpcConnection = () => {
    try {
        const connectionProfile = (0, exports.loadConnectionProfile)();
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
        }
        catch (tlsError) {
            console.error('Error loading TLS certificate:', tlsError);
            console.warn('SECURITY WARNING: Falling back to insecure connection!');
            tlsCredentials = grpc.credentials.createInsecure();
        }
        // Enhanced gRPC options for better network compatibility
        const grpcOptions = {
            'grpc.ssl_target_name_override': getPeerHostname(connectionProfile),
            'grpc.default_authority': getPeerHostname(connectionProfile),
            // Add longer timeouts for better network handling
            'grpc.keepalive_time_ms': 120000, // 2 min
            'grpc.http2.min_time_between_pings_ms': 120000, // 2 min
            'grpc.keepalive_timeout_ms': 20000, // 20 sec
            'grpc.http2.max_pings_without_data': 0, // Allow unlimited pings
            'grpc.max_receive_message_length': 10 * 1024 * 1024, // 10MB max message size
            'grpc.max_send_message_length': 10 * 1024 * 1024, // 10MB max message size
            'grpc.enable_retries': 1, // Enable retries
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
    }
    catch (error) {
        console.error('Failed to create gRPC connection:', error);
        throw new Error(`Failed to establish gRPC connection: ${error}`);
    }
};
exports.createGrpcConnection = createGrpcConnection;
/**
 * Extract peer endpoint from connection profile
 */
const getPeerEndpoint = (connectionProfile) => {
    try {
        // Get the first org's first peer URL from the connection profile
        const orgs = Object.values(connectionProfile.organizations || {});
        if (!orgs.length) {
            throw new Error('No organizations found in connection profile');
        }
        const org = orgs[0];
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
    }
    catch (error) {
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
const getPeerHostname = (connectionProfile) => {
    try {
        const orgs = Object.values(connectionProfile.organizations || {});
        if (!orgs.length) {
            return '';
        }
        const org = orgs[0];
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
                }
                catch (e) {
                    // If URL parsing fails, try to extract hostname directly
                    const parts = urlStr.split('://')[1].split(':')[0];
                    hostname = parts;
                }
            }
            else if (urlStr.includes(':')) {
                // Handle format like "localhost:7051"
                hostname = urlStr.split(':')[0];
            }
            else {
                hostname = urlStr;
            }
            console.log(`Extracted hostname from URL: ${hostname}`);
            return hostname;
        }
        return '';
    }
    catch (error) {
        console.error('Error getting peer hostname:', error);
        return '';
    }
};
/**
 * Load TLS certificate for secure communication with peer
 */
const loadTlsRootCert = (connectionProfile) => {
    const org = Object.values(connectionProfile.organizations)[0];
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
const loadConnectionProfile = () => {
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
    }
    catch (error) {
        console.error(`Error loading connection profile: ${error}`);
        throw new Error(`Failed to load connection profile from ${ccpPath}: ${error}`);
    }
};
exports.loadConnectionProfile = loadConnectionProfile;
/**
 * Initialize the connection to the Fabric network and return a contract
 */
const initFabric = async () => {
    try {
        // Create gRPC connection
        console.log('Creating gRPC connection...');
        const client = (0, exports.createGrpcConnection)();
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
            }
            catch (error) {
                console.warn(`- Could not read old format wallet: ${error}`);
            }
        }
        // Load identity and signer
        try {
            console.log(`Loading identity for ${config.userId}...`);
            const identity = await (0, exports.loadIdentity)(config.userId);
            console.log(`Loading signer for ${config.userId}...`);
            const signer = await (0, exports.loadSigner)(config.userId);
            // Set deadlines for various operations
            const currentDate = Date.now();
            const queryTimeout = currentDate + (config.queryTimeout * 1000);
            const endorseTimeout = currentDate + (config.endorseTimeout * 1000);
            const submitTimeout = currentDate + (config.submitTimeout * 1000);
            const commitTimeout = currentDate + (config.commitTimeout * 1000);
            // Connect to gateway with more robust options
            console.log('Connecting to Fabric gateway...');
            const gateway = await (0, fabric_gateway_1.connect)({
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
                }
                else {
                    console.log('Ledger appears to be empty, no donations found');
                }
            }
            catch (queryError) {
                const errMsg = queryError instanceof Error ? queryError.message : String(queryError);
                console.warn(`Test query failed: ${errMsg}`);
                // Check for specific errors
                if (errMsg.includes('creator org unknown') || errMsg.includes('access denied')) {
                    console.error('ERROR: Identity validation failed. The certificate or MSP ID may be incorrect.');
                    console.log('Creating a new identity may resolve this issue.');
                }
                else {
                    console.log('Connection appears to be working, but query failed. This may be normal if the ledger is empty.');
                    // Try initializing the ledger if not already initialized
                    try {
                        console.log('Attempting to initialize the ledger...');
                        await contract.submitTransaction('InitLedger');
                        console.log('Ledger initialized successfully');
                    }
                    catch (initError) {
                        const initErrMsg = initError instanceof Error ? initError.message : String(initError);
                        console.warn(`Ledger initialization failed: ${initErrMsg}`);
                        console.log('This may be normal if the ledger is already initialized or if InitLedger function does not exist');
                    }
                }
            }
            return contract;
        }
        catch (identityError) {
            console.error('Failed to load identity or connect to gateway:', identityError);
            if (!fs.existsSync(oldFormatPath) && !fs.existsSync(newFormatPath)) {
                console.error('\nERROR: User identity not found in wallet.');
                console.error(`Neither ${config.userId}.id nor ${config.userId}/cert.pem exists.`);
                console.error('\nTo fix this issue:');
                console.error('1. Run enrollAdmin.ts to create admin credentials');
                console.error('2. Run registerUser.ts to create user credentials');
                console.error('\nTry running: npm run enroll-admin && npm run register-user');
            }
            else if (fs.existsSync(oldFormatPath)) {
                try {
                    // Try to provide diagnostic info about the old format identity
                    const idContent = JSON.parse(fs.readFileSync(oldFormatPath, 'utf8'));
                    console.error('\nFound old format identity file but couldn\'t use it.');
                    console.error(`- Has certificate: ${!!idContent?.credentials?.certificate}`);
                    console.error(`- Has private key: ${!!idContent?.credentials?.privateKey}`);
                    console.error(`- MSP ID: ${idContent?.mspId || 'Not found'}`);
                }
                catch (readError) {
                    console.error(`Error reading identity file: ${readError}`);
                }
            }
            throw new Error(`Failed to initialize Fabric connection: ${identityError}`);
        }
    }
    catch (error) {
        console.error('Failed to initialize Fabric connection:', error);
        throw error;
    }
};
exports.initFabric = initFabric;
/**
 * Evaluate a transaction (query)
 */
const evaluateTransaction = async (contract, transactionName, ...transactionArgs) => {
    console.log(`Evaluating transaction: ${transactionName}`);
    try {
        const result = await contract.evaluateTransaction(transactionName, ...transactionArgs);
        console.log(`Transaction ${transactionName} evaluated successfully`);
        return result;
    }
    catch (error) {
        console.error(`Error evaluating transaction ${transactionName}:`, error);
        throw error;
    }
};
exports.evaluateTransaction = evaluateTransaction;
/**
 * Submit a transaction (update)
 */
const submitTransaction = async (contract, transactionName, ...transactionArgs) => {
    console.log(`Submitting transaction: ${transactionName}`);
    try {
        const result = await contract.submitTransaction(transactionName, ...transactionArgs);
        console.log(`Transaction ${transactionName} submitted successfully`);
        return result;
    }
    catch (error) {
        console.error(`Error submitting transaction ${transactionName}:`, error);
        throw error;
    }
};
exports.submitTransaction = submitTransaction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFicmljLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2ZhYnJpYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILG9EQUFzQztBQUN0QyxnRUFBMkY7QUFDM0YsK0NBQWlDO0FBQ2pDLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0IsaURBQW1DO0FBRW5DOztHQUVHO0FBQ0ksTUFBTSxZQUFZLEdBQUcsS0FBSyxFQUFFLGFBQXFCLEVBQXFCLEVBQUU7SUFDM0UsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRS9ELHNEQUFzRDtJQUN0RCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUMzRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUV0RCwwQ0FBMEM7SUFDMUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxhQUFhLEtBQUssQ0FBQyxDQUFDO0lBRW5FLElBQUksQ0FBQztRQUNELHVCQUF1QjtRQUN2QixJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQzdELE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRS9DLE9BQU87Z0JBQ0gsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO2dCQUNuQixXQUFXLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFD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Rjs7R0FFRztBQUNJLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxFQUNsQyxRQUFrQixFQUNsQixlQUF1QixFQUN2QixHQUFHLGVBQXlCLEVBQ1QsRUFBRTtJQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixlQUFlLEVBQUUsQ0FBQyxDQUFDO0lBRTFELElBQUksQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLE1BQU0sUUFBUSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxHQUFHLGVBQWUsQ0FBQyxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxlQUFlLHlCQUF5QixDQUFDLENBQUM7UUFDckUsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxlQUFlLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6RSxNQUFNLEtBQUssQ0FBQztJQUNoQixDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBZlcsUUFBQSxpQkFBaUIscUJBZTVCIiwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcclxuICovXHJcblxyXG5pbXBvcnQgKiBhcyBncnBjIGZyb20gJ0BncnBjL2dycGMtanMnO1xyXG5pbXBvcnQgeyBjb25uZWN0LCBDb250cmFjdCwgSWRlbnRpdHksIFNpZ25lciwgc2lnbmVycyB9IGZyb20gJ0BoeXBlcmxlZGdlci9mYWJyaWMtZ2F0ZXdheSc7XHJcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCAqIGFzIGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XHJcblxyXG4vKipcclxuICogTG9hZCBhbiBpZGVudGl0eSBmcm9tIHRoZSB3YWxsZXQgZGlyZWN0b3J5IC0gc3VwcG9ydHMgYm90aCBvbGQgYW5kIG5ldyB3YWxsZXQgZm9ybWF0c1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGxvYWRJZGVudGl0eSA9IGFzeW5jIChpZGVudGl0eUxhYmVsOiBzdHJpbmcpOiBQcm9taXNlPElkZW50aXR5PiA9PiB7XHJcbiAgICBjb25zdCB3YWxsZXRQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIGNvbmZpZy53YWxsZXRQYXRoKTtcclxuICAgIFxyXG4gICAgLy8gQ2hlY2sgZm9yIG5ldyB3YWxsZXQgZm9ybWF0IChkaXJlY3QgY2VydC5wZW0gZmlsZXMpXHJcbiAgICBjb25zdCBuZXdGb3JtYXRQYXRoID0gcGF0aC5qb2luKHdhbGxldFBhdGgsIGlkZW50aXR5TGFiZWwpO1xyXG4gICAgY29uc3QgY2VydFBhdGggPSBwYXRoLmpvaW4obmV3Rm9ybWF0UGF0aCwgJ2NlcnQucGVtJyk7XHJcbiAgICBcclxuICAgIC8vIENoZWNrIGZvciBvbGQgd2FsbGV0IGZvcm1hdCAoLmlkIGZpbGVzKVxyXG4gICAgY29uc3Qgb2xkRm9ybWF0UGF0aCA9IHBhdGguam9pbih3YWxsZXRQYXRoLCBgJHtpZGVudGl0eUxhYmVsfS5pZGApO1xyXG4gICAgXHJcbiAgICB0cnkge1xyXG4gICAgICAgIC8vIFRyeSBuZXcgZm9ybWF0IGZpcnN0XHJcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoY2VydFBhdGgpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBMb2FkaW5nIGlkZW50aXR5IGZyb20gbmV3IGZvcm1hdDogJHtjZXJ0UGF0aH1gKTtcclxuICAgICAgICAgICAgY29uc3QgY2VydCA9IGZzLnJlYWRGaWxlU3luYyhjZXJ0UGF0aCwgJ3V0ZjgnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBtc3BJZDogY29uZmlnLm1zcElkLFxyXG4gICAgICAgICAgICAgICAgY3JlZGVudGlhbHM6IEJ1ZmZlci5mcm9tKGNlcnQpLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBUcnkgb2xkIGZvcm1hdCBpZiBuZXcgZm9ybWF0IGRvZXNuJ3QgZXhpc3RcclxuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhvbGRGb3JtYXRQYXRoKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTG9hZGluZyBpZGVudGl0eSBmcm9tIG9sZCB3YWxsZXQgZm9ybWF0OiAke29sZEZvcm1hdFBhdGh9YCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkRGF0YSA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKG9sZEZvcm1hdFBhdGgsICd1dGY4JykpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gUHJpbnQgaWRlbnRpdHkgZGF0YSBmb3IgZGVidWdnaW5nXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJZGVudGl0eSBkYXRhIHN0cnVjdHVyZTonLCBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBpZERhdGEudHlwZSxcclxuICAgICAgICAgICAgICAgIG1zcElkOiBpZERhdGEubXNwSWQsXHJcbiAgICAgICAgICAgICAgICBoYXNDZXJ0aWZpY2F0ZTogISFpZERhdGEuY3JlZGVudGlhbHM/LmNlcnRpZmljYXRlLFxyXG4gICAgICAgICAgICAgICAgaGFzUHJpdmF0ZUtleTogISFpZERhdGEuY3JlZGVudGlhbHM/LnByaXZhdGVLZXlcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gRXh0cmFjdCBpZGVudGl0eSBmcm9tIG9sZCB3YWxsZXQgZm9ybWF0XHJcbiAgICAgICAgICAgIGlmIChpZERhdGEudHlwZSA9PT0gJ1guNTA5JyAmJiBpZERhdGEuY3JlZGVudGlhbHMgJiYgaWREYXRhLmNyZWRlbnRpYWxzLmNlcnRpZmljYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBBbHdheXMgdXNlIG1zcElkIGZyb20gY29uZmlnIGlmIGl0J3Mgbm90IGluIHRoZSB3YWxsZXQgZmlsZSBvciB0byBlbnN1cmUgY29uc2lzdGVuY3lcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1zcElkID0gaWREYXRhLm1zcElkIHx8IGNvbmZpZy5tc3BJZDtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVc2luZyBNU1AgSUQ6ICR7bXNwSWR9YCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbXNwSWQ6IG1zcElkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNyZWRlbnRpYWxzOiBCdWZmZXIuZnJvbShpZERhdGEuY3JlZGVudGlhbHMuY2VydGlmaWNhdGUpLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBpZGVudGl0eSBmb3JtYXQgaW4gJHtvbGRGb3JtYXRQYXRofWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSWRlbnRpdHkgbm90IGZvdW5kIGZvciAke2lkZW50aXR5TGFiZWx9IGluIGVpdGhlciBmb3JtYXRgKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgbG9hZGluZyBpZGVudGl0eTogJHtlcnJvcn1gKTtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBsb2FkIGlkZW50aXR5IGZvciAke2lkZW50aXR5TGFiZWx9OiAke2Vycm9yfWApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIExvYWQgYSBwcml2YXRlIGtleSBhbmQgY3JlYXRlIGEgc2lnbmVyIC0gc3VwcG9ydHMgYm90aCBvbGQgYW5kIG5ldyB3YWxsZXQgZm9ybWF0c1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGxvYWRTaWduZXIgPSBhc3luYyAoaWRlbnRpdHlMYWJlbDogc3RyaW5nKTogUHJvbWlzZTxTaWduZXI+ID0+IHtcclxuICAgIGNvbnN0IHdhbGxldFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgY29uZmlnLndhbGxldFBhdGgpO1xyXG4gICAgXHJcbiAgICAvLyBDaGVjayBmb3IgbmV3IHdhbGxldCBmb3JtYXRcclxuICAgIGNvbnN0IG5ld0Zvcm1hdFBhdGggPSBwYXRoLmpvaW4od2FsbGV0UGF0aCwgaWRlbnRpdHlMYWJlbCk7XHJcbiAgICBjb25zdCBrZXlQYXRoID0gcGF0aC5qb2luKG5ld0Zvcm1hdFBhdGgsICdrZXkucGVtJyk7XHJcbiAgICBcclxuICAgIC8vIENoZWNrIGZvciBvbGQgd2FsbGV0IGZvcm1hdFxyXG4gICAgY29uc3Qgb2xkRm9ybWF0UGF0aCA9IHBhdGguam9pbih3YWxsZXRQYXRoLCBgJHtpZGVudGl0eUxhYmVsfS5pZGApO1xyXG4gICAgXHJcbiAgICB0cnkge1xyXG4gICAgICAgIC8vIFRyeSBuZXcgZm9ybWF0IGZpcnN0XHJcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoa2V5UGF0aCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYExvYWRpbmcgc2lnbmVyIGZyb20gbmV3IGZvcm1hdDogJHtrZXlQYXRofWApO1xyXG4gICAgICAgICAgICBjb25zdCBwcml2YXRlS2V5UGVtID0gZnMucmVhZEZpbGVTeW5jKGtleVBhdGgsICd1dGY4Jyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHByaXZhdGVLZXkgPSBjcnlwdG8uY3JlYXRlUHJpdmF0ZUtleShwcml2YXRlS2V5UGVtKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNpZ25lcnMubmV3UHJpdmF0ZUtleVNpZ25lcihwcml2YXRlS2V5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVHJ5IG9sZCBmb3JtYXQgaWYgbmV3IGZvcm1hdCBkb2Vzbid0IGV4aXN0XHJcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMob2xkRm9ybWF0UGF0aCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYExvYWRpbmcgc2lnbmVyIGZyb20gb2xkIHdhbGxldCBmb3JtYXQ6ICR7b2xkRm9ybWF0UGF0aH1gKTtcclxuICAgICAgICAgICAgY29uc3QgaWREYXRhID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMob2xkRm9ybWF0UGF0aCwgJ3V0ZjgnKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBFeHRyYWN0IHByaXZhdGUga2V5IGZyb20gb2xkIHdhbGxldCBmb3JtYXRcclxuICAgICAgICAgICAgaWYgKGlkRGF0YS50eXBlID09PSAnWC41MDknICYmIGlkRGF0YS5jcmVkZW50aWFscyAmJiBpZERhdGEuY3JlZGVudGlhbHMucHJpdmF0ZUtleSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTYW5pdGl6ZSBwcml2YXRlIGtleSBmb3JtYXQgLSBzb21lIG9sZCB3YWxsZXQgZm9ybWF0cyBtYXkgbm90IGhhdmUgcHJvcGVyIFBFTSBmb3JtYXR0aW5nXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByaXZhdGVLZXlQZW0gPSBpZERhdGEuY3JlZGVudGlhbHMucHJpdmF0ZUtleTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiBpdCBoYXMgcHJvcGVyIFBFTSBoZWFkZXIvZm9vdGVyLCBhZGQgaWYgbWlzc2luZ1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcHJpdmF0ZUtleVBlbS5pbmNsdWRlcygnLS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1ByaXZhdGUga2V5IGlzIG1pc3NpbmcgUEVNIGhlYWRlci9mb290ZXIsIGFkZGluZyBpdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcml2YXRlS2V5UGVtID0gYC0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxcbiR7cHJpdmF0ZUtleVBlbX1cXG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tYDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIHByaXZhdGUga2V5IGZyb20gUEVNIGRhdGEnKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcml2YXRlS2V5ID0gY3J5cHRvLmNyZWF0ZVByaXZhdGVLZXkocHJpdmF0ZUtleVBlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIHNpZ25lciBmcm9tIHByaXZhdGUga2V5Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNpZ25lcnMubmV3UHJpdmF0ZUtleVNpZ25lcihwcml2YXRlS2V5KTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGtleUVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgcGFyc2luZyBwcml2YXRlIGtleTonLCBrZXlFcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gcGFyc2UgcHJpdmF0ZSBrZXk6ICR7a2V5RXJyb3J9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgaWRlbnRpdHkgZm9ybWF0IG9yIG1pc3NpbmcgcHJpdmF0ZSBrZXkgaW4gJHtvbGRGb3JtYXRQYXRofWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU2lnbmVyIG5vdCBmb3VuZCBmb3IgJHtpZGVudGl0eUxhYmVsfSBpbiBlaXRoZXIgZm9ybWF0YCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGxvYWRpbmcgc2lnbmVyOiAke2Vycm9yfWApO1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGxvYWQgc2lnbmVyIGZvciAke2lkZW50aXR5TGFiZWx9OiAke2Vycm9yfWApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhIGdSUEMgY2xpZW50IGNvbm5lY3Rpb24gdG8gdGhlIEZhYnJpYyBuZXR3b3JrXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgY3JlYXRlR3JwY0Nvbm5lY3Rpb24gPSAoKTogZ3JwYy5DbGllbnQgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBjb25uZWN0aW9uUHJvZmlsZSA9IGxvYWRDb25uZWN0aW9uUHJvZmlsZSgpO1xyXG4gICAgICAgIGNvbnN0IHBlZXJFbmRwb2ludCA9IGdldFBlZXJFbmRwb2ludChjb25uZWN0aW9uUHJvZmlsZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2coYENyZWF0aW5nIGdSUEMgY29ubmVjdGlvbiB0byBwZWVyOiAke3BlZXJFbmRwb2ludH1gKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBNYWtlIHN1cmUgZW5kcG9pbnQgZG9lc24ndCBoYXZlIHByb3RvY29sIHByZWZpeCBmb3IgZ1JQQyBjbGllbnRcclxuICAgICAgICBjb25zdCBjbGVhbkVuZHBvaW50ID0gcGVlckVuZHBvaW50LnJlcGxhY2UoL14oZ3JwY3M/OlxcL1xcL3xkbnM6KS8sICcnKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgVXNpbmcgY2xlYW5lZCBlbmRwb2ludDogJHtjbGVhbkVuZHBvaW50fWApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCB0bHNDcmVkZW50aWFscztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCB0bHNSb290Q2VydCA9IGxvYWRUbHNSb290Q2VydChjb25uZWN0aW9uUHJvZmlsZSk7XHJcbiAgICAgICAgICAgIHRsc0NyZWRlbnRpYWxzID0gZ3JwYy5jcmVkZW50aWFscy5jcmVhdGVTc2wodGxzUm9vdENlcnQpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQ3JlYXRlZCBUTFMgY3JlZGVudGlhbHMgZm9yIHNlY3VyZSBjb25uZWN0aW9uJyk7XHJcbiAgICAgICAgfSBjYXRjaCAodGxzRXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgbG9hZGluZyBUTFMgY2VydGlmaWNhdGU6JywgdGxzRXJyb3IpO1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1NFQ1VSSVRZIFdBUk5JTkc6IEZhbGxpbmcgYmFjayB0byBpbnNlY3VyZSBjb25uZWN0aW9uIScpO1xyXG4gICAgICAgICAgICB0bHNDcmVkZW50aWFscyA9IGdycGMuY3JlZGVudGlhbHMuY3JlYXRlSW5zZWN1cmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gRW5oYW5jZWQgZ1JQQyBvcHRpb25zIGZvciBiZXR0ZXIgbmV0d29yayBjb21wYXRpYmlsaXR5XHJcbiAgICAgICAgY29uc3QgZ3JwY09wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICdncnBjLnNzbF90YXJnZXRfbmFtZV9vdmVycmlkZSc6IGdldFBlZXJIb3N0bmFtZShjb25uZWN0aW9uUHJvZmlsZSksXHJcbiAgICAgICAgICAgICdncnBjLmRlZmF1bHRfYXV0aG9yaXR5JzogZ2V0UGVlckhvc3RuYW1lKGNvbm5lY3Rpb25Qcm9maWxlKSxcclxuICAgICAgICAgICAgLy8gQWRkIGxvbmdlciB0aW1lb3V0cyBmb3IgYmV0dGVyIG5ldHdvcmsgaGFuZGxpbmdcclxuICAgICAgICAgICAgJ2dycGMua2VlcGFsaXZlX3RpbWVfbXMnOiAxMjAwMDAsICAgICAgICAgICAgICAgIC8vIDIgbWluXHJcbiAgICAgICAgICAgICdncnBjLmh0dHAyLm1pbl90aW1lX2JldHdlZW5fcGluZ3NfbXMnOiAxMjAwMDAsICAvLyAyIG1pblxyXG4gICAgICAgICAgICAnZ3JwYy5rZWVwYWxpdmVfdGltZW91dF9tcyc6IDIwMDAwLCAgICAgICAgICAgICAgLy8gMjAgc2VjXHJcbiAgICAgICAgICAgICdncnBjLmh0dHAyLm1heF9waW5nc193aXRob3V0X2RhdGEnOiAwLCAgICAgICAgICAvLyBBbGxvdyB1bmxpbWl0ZWQgcGluZ3NcclxuICAgICAgICAgICAgJ2dycGMubWF4X3JlY2VpdmVfbWVzc2FnZV9sZW5ndGgnOiAxMCAqIDEwMjQgKiAxMDI0LCAvLyAxME1CIG1heCBtZXNzYWdlIHNpemVcclxuICAgICAgICAgICAgJ2dycGMubWF4X3NlbmRfbWVzc2FnZV9sZW5ndGgnOiAxMCAqIDEwMjQgKiAxMDI0LCAgICAvLyAxME1CIG1heCBtZXNzYWdlIHNpemVcclxuICAgICAgICAgICAgJ2dycGMuZW5hYmxlX3JldHJpZXMnOiAxLCAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVuYWJsZSByZXRyaWVzXHJcbiAgICAgICAgICAgICdncnBjLnNlcnZpY2VfY29uZmlnJzogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgJ21ldGhvZENvbmZpZyc6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgJ25hbWUnOiBbeyAnc2VydmljZSc6ICdwcm90b3MuR2F0ZXdheScgfV0sXHJcbiAgICAgICAgICAgICAgICAgICAgJ3JldHJ5UG9saWN5Jzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWF4QXR0ZW1wdHMnOiA1LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnaW5pdGlhbEJhY2tvZmYnOiAnMXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWF4QmFja29mZic6ICcxMHMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnYmFja29mZk11bHRpcGxpZXInOiAyLjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdyZXRyeWFibGVTdGF0dXNDb2Rlcyc6IFsnVU5BVkFJTEFCTEUnLCAnREVBRExJTkVfRVhDRUVERUQnXVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBDcmVhdGUgY2xpZW50IHdpdGggZW5oYW5jZWQgb3B0aW9uc1xyXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IG5ldyBncnBjLkNsaWVudChjbGVhbkVuZHBvaW50LCB0bHNDcmVkZW50aWFscywgZ3JwY09wdGlvbnMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdnUlBDIGNsaWVudCBjb25uZWN0aW9uIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5Jyk7XHJcbiAgICAgICAgcmV0dXJuIGNsaWVudDtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNyZWF0ZSBnUlBDIGNvbm5lY3Rpb246JywgZXJyb3IpO1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGVzdGFibGlzaCBnUlBDIGNvbm5lY3Rpb246ICR7ZXJyb3J9YCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRXh0cmFjdCBwZWVyIGVuZHBvaW50IGZyb20gY29ubmVjdGlvbiBwcm9maWxlXHJcbiAqL1xyXG5jb25zdCBnZXRQZWVyRW5kcG9pbnQgPSAoY29ubmVjdGlvblByb2ZpbGU6IGFueSk6IHN0cmluZyA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIC8vIEdldCB0aGUgZmlyc3Qgb3JnJ3MgZmlyc3QgcGVlciBVUkwgZnJvbSB0aGUgY29ubmVjdGlvbiBwcm9maWxlXHJcbiAgICAgICAgY29uc3Qgb3JncyA9IE9iamVjdC52YWx1ZXMoY29ubmVjdGlvblByb2ZpbGUub3JnYW5pemF0aW9ucyB8fCB7fSk7XHJcbiAgICAgICAgaWYgKCFvcmdzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIG9yZ2FuaXphdGlvbnMgZm91bmQgaW4gY29ubmVjdGlvbiBwcm9maWxlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IG9yZyA9IG9yZ3NbMF0gYXMgYW55O1xyXG4gICAgICAgIGlmICghb3JnLnBlZXJzIHx8ICFvcmcucGVlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gcGVlcnMgZm91bmQgZm9yIG9yZ2FuaXphdGlvbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBwZWVySWQgPSBvcmcucGVlcnNbMF07XHJcbiAgICAgICAgaWYgKCFjb25uZWN0aW9uUHJvZmlsZS5wZWVycyB8fCAhY29ubmVjdGlvblByb2ZpbGUucGVlcnNbcGVlcklkXSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBlZXIgJHtwZWVySWR9IG5vdCBmb3VuZCBpbiBjb25uZWN0aW9uIHByb2ZpbGVgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgcGVlciA9IGNvbm5lY3Rpb25Qcm9maWxlLnBlZXJzW3BlZXJJZF07XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVXNlIHVybCBwcm9wZXJ0eSBmb3IgdGhlIGdSUEMgZW5kcG9pbnRcclxuICAgICAgICBpZiAoIXBlZXIudXJsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gVVJMIGRlZmluZWQgZm9yIHBlZXIgJHtwZWVySWR9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBncnBjVXJsID0gcGVlci51cmw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gRW5zdXJlIFVSTCBkb2Vzbid0IGhhdmUgYSBkbnM6IHByZWZpeFxyXG4gICAgICAgIGlmIChncnBjVXJsLnN0YXJ0c1dpdGgoJ2RuczonKSkge1xyXG4gICAgICAgICAgICBncnBjVXJsID0gZ3JwY1VybC5zdWJzdHJpbmcoNCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIElmIHJ1bm5pbmcgaW4gbG9jYWwgZGV2ZWxvcG1lbnQgbW9kZSB3aXRoIGRvY2tlciwgd2UgbWlnaHQgbmVlZCB0byB0cmFuc2Zvcm0gdGhlIFVSTFxyXG4gICAgICAgIGlmIChjb25maWcuYXNMb2NhbGhvc3QgJiYgZ3JwY1VybC5pbmNsdWRlcygnbG9jYWxob3N0JykpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFVzaW5nIGxvY2FsIHBlZXIgVVJMOiAke2dycGNVcmx9YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBncnBjVXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZyhgVXNpbmcgcGVlciBVUkw6ICR7Z3JwY1VybH1gKTtcclxuICAgICAgICByZXR1cm4gZ3JwY1VybDtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZXh0cmFjdGluZyBwZWVyIGVuZHBvaW50OicsIGVycm9yKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBGYWxsYmFjayB0byBhIGRlZmF1bHQgZW5kcG9pbnQgZm9yIGRldmVsb3BtZW50XHJcbiAgICAgICAgY29uc3QgZmFsbGJhY2tVcmwgPSAnbG9jYWxob3N0OjcwNTEnO1xyXG4gICAgICAgIGNvbnNvbGUud2FybihgVXNpbmcgZmFsbGJhY2sgcGVlciBlbmRwb2ludDogJHtmYWxsYmFja1VybH1gKTtcclxuICAgICAgICByZXR1cm4gZmFsbGJhY2tVcmw7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHBlZXIgaG9zdG5hbWUgZnJvbSBjb25uZWN0aW9uIHByb2ZpbGUgZm9yIFRMUyB2ZXJpZmljYXRpb25cclxuICovXHJcbmNvbnN0IGdldFBlZXJIb3N0bmFtZSA9IChjb25uZWN0aW9uUHJvZmlsZTogYW55KTogc3RyaW5nID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgb3JncyA9IE9iamVjdC52YWx1ZXMoY29ubmVjdGlvblByb2ZpbGUub3JnYW5pemF0aW9ucyB8fCB7fSk7XHJcbiAgICAgICAgaWYgKCFvcmdzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IG9yZyA9IG9yZ3NbMF0gYXMgYW55O1xyXG4gICAgICAgIGlmICghb3JnLnBlZXJzIHx8ICFvcmcucGVlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgcGVlcklkID0gb3JnLnBlZXJzWzBdO1xyXG4gICAgICAgIGlmICghY29ubmVjdGlvblByb2ZpbGUucGVlcnMgfHwgIWNvbm5lY3Rpb25Qcm9maWxlLnBlZXJzW3BlZXJJZF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBwZWVyID0gY29ubmVjdGlvblByb2ZpbGUucGVlcnNbcGVlcklkXTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAocGVlci5ncnBjT3B0aW9ucyAmJiBwZWVyLmdycGNPcHRpb25zWydzc2wtdGFyZ2V0LW5hbWUtb3ZlcnJpZGUnXSkge1xyXG4gICAgICAgICAgICBjb25zdCBob3N0bmFtZSA9IHBlZXIuZ3JwY09wdGlvbnNbJ3NzbC10YXJnZXQtbmFtZS1vdmVycmlkZSddO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgVXNpbmcgU1NMIHRhcmdldCBuYW1lIG92ZXJyaWRlOiAke2hvc3RuYW1lfWApO1xyXG4gICAgICAgICAgICByZXR1cm4gaG9zdG5hbWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEV4dHJhY3QgaG9zdG5hbWUgZnJvbSBVUkwgYXMgZmFsbGJhY2tcclxuICAgICAgICBpZiAocGVlci51cmwpIHtcclxuICAgICAgICAgICAgLy8gSGFuZGxlIGRpZmZlcmVudCBVUkwgZm9ybWF0c1xyXG4gICAgICAgICAgICBsZXQgaG9zdG5hbWUgPSAnJztcclxuICAgICAgICAgICAgY29uc3QgdXJsU3RyID0gcGVlci51cmw7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodXJsU3RyLmluY2x1ZGVzKCc6Ly8nKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gUGFyc2Ugc3RhbmRhcmQgVVJMXHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwodXJsU3RyKTtcclxuICAgICAgICAgICAgICAgICAgICBob3N0bmFtZSA9IHVybC5ob3N0bmFtZTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBVUkwgcGFyc2luZyBmYWlscywgdHJ5IHRvIGV4dHJhY3QgaG9zdG5hbWUgZGlyZWN0bHlcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0cyA9IHVybFN0ci5zcGxpdCgnOi8vJylbMV0uc3BsaXQoJzonKVswXTtcclxuICAgICAgICAgICAgICAgICAgICBob3N0bmFtZSA9IHBhcnRzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHVybFN0ci5pbmNsdWRlcygnOicpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgZm9ybWF0IGxpa2UgXCJsb2NhbGhvc3Q6NzA1MVwiXHJcbiAgICAgICAgICAgICAgICBob3N0bmFtZSA9IHVybFN0ci5zcGxpdCgnOicpWzBdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaG9zdG5hbWUgPSB1cmxTdHI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBFeHRyYWN0ZWQgaG9zdG5hbWUgZnJvbSBVUkw6ICR7aG9zdG5hbWV9YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBob3N0bmFtZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIHBlZXIgaG9zdG5hbWU6JywgZXJyb3IpO1xyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBMb2FkIFRMUyBjZXJ0aWZpY2F0ZSBmb3Igc2VjdXJlIGNvbW11bmljYXRpb24gd2l0aCBwZWVyXHJcbiAqL1xyXG5jb25zdCBsb2FkVGxzUm9vdENlcnQgPSAoY29ubmVjdGlvblByb2ZpbGU6IGFueSk6IEJ1ZmZlciA9PiB7XHJcbiAgICBjb25zdCBvcmcgPSBPYmplY3QudmFsdWVzKGNvbm5lY3Rpb25Qcm9maWxlLm9yZ2FuaXphdGlvbnMpWzBdIGFzIGFueTtcclxuICAgIGNvbnN0IHBlZXJJZCA9IG9yZy5wZWVyc1swXTtcclxuICAgIGNvbnN0IHBlZXIgPSBjb25uZWN0aW9uUHJvZmlsZS5wZWVyc1twZWVySWRdO1xyXG4gICAgXHJcbiAgICAvLyBIYW5kbGUgZGlmZmVyZW50IGZvcm1hdHMgb2YgVExTIGNlcnRpZmljYXRlcyBpbiBjb25uZWN0aW9uIHByb2ZpbGVzXHJcbiAgICBpZiAocGVlci50bHNDQUNlcnRzKSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIFRMUyBjZXJ0IGlzIGVtYmVkZGVkIGFzIFBFTSBzdHJpbmcgZGlyZWN0bHlcclxuICAgICAgICBpZiAocGVlci50bHNDQUNlcnRzLnBlbSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnVXNpbmcgZW1iZWRkZWQgUEVNIGNlcnRpZmljYXRlIGZvciBUTFMnKTtcclxuICAgICAgICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHBlZXIudGxzQ0FDZXJ0cy5wZW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBDaGVjayBpZiB0aGVyZSdzIGEgcGF0aCB0byBhIGNlcnRpZmljYXRlIGZpbGVcclxuICAgICAgICBpZiAocGVlci50bHNDQUNlcnRzLnBhdGgpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYExvYWRpbmcgVExTIGNlcnRpZmljYXRlIGZyb20gcGF0aDogJHtwZWVyLnRsc0NBQ2VydHMucGF0aH1gKTtcclxuICAgICAgICAgICAgY29uc3QgdGxzQ2VydFBhdGggPSBwYXRoLmlzQWJzb2x1dGUocGVlci50bHNDQUNlcnRzLnBhdGgpXHJcbiAgICAgICAgICAgICAgICA/IHBlZXIudGxzQ0FDZXJ0cy5wYXRoXHJcbiAgICAgICAgICAgICAgICA6IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBwZWVyLnRsc0NBQ2VydHMucGF0aCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHRsc0NlcnRQYXRoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIElmIHdlIGdldCBoZXJlLCB3ZSBjb3VsZG4ndCBmaW5kIGEgdmFsaWQgVExTIGNlcnQgLSB0cnkgdG8gZmluZCBpdCBpbiB0aGUgXHJcbiAgICAvLyBjZXJ0aWZpY2F0ZUF1dGhvcml0aWVzIHNlY3Rpb24gaW5zdGVhZFxyXG4gICAgaWYgKGNvbm5lY3Rpb25Qcm9maWxlLmNlcnRpZmljYXRlQXV0aG9yaXRpZXMpIHtcclxuICAgICAgICBjb25zdCBjYU5hbWUgPSBPYmplY3Qua2V5cyhjb25uZWN0aW9uUHJvZmlsZS5jZXJ0aWZpY2F0ZUF1dGhvcml0aWVzKVswXTtcclxuICAgICAgICBjb25zdCBjYSA9IGNvbm5lY3Rpb25Qcm9maWxlLmNlcnRpZmljYXRlQXV0aG9yaXRpZXNbY2FOYW1lXTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoY2EudGxzQ0FDZXJ0cyAmJiBjYS50bHNDQUNlcnRzLnBlbSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnVXNpbmcgQ0EgVExTIGNlcnRpZmljYXRlIGZvciBwZWVyIGNvbm5lY3Rpb24nKTtcclxuICAgICAgICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKGNhLnRsc0NBQ2VydHMucGVtKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIEZvciBkZXZlbG9wbWVudCBlbnZpcm9ubWVudHMsIHdlIG1pZ2h0IGFsbG93IGluc2VjdXJlIGNvbm5lY3Rpb25zXHJcbiAgICBjb25zb2xlLndhcm4oJ1dBUk5JTkc6IE5vIHZhbGlkIFRMUyBjZXJ0aWZpY2F0ZSBmb3VuZCBpbiBjb25uZWN0aW9uIHByb2ZpbGUhJyk7XHJcbiAgICBjb25zb2xlLndhcm4oJ0F0dGVtcHRpbmcgdG8gcHJvY2VlZCB3aXRoIGFuIGVtcHR5IGNlcnRpZmljYXRlIChpbnNlY3VyZSknKTtcclxuICAgIHJldHVybiBCdWZmZXIuZnJvbSgnJyk7XHJcbn07XHJcblxyXG4vKipcclxuICogTG9hZCBjb25uZWN0aW9uIHByb2ZpbGUgZnJvbSBmaWxlc3lzdGVtXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbG9hZENvbm5lY3Rpb25Qcm9maWxlID0gKCk6IGFueSA9PiB7XHJcbiAgICBjb25zdCBjY3BQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGNvbmZpZy5jb25uZWN0aW9uUHJvZmlsZVBhdGgpO1xyXG4gICAgY29uc29sZS5sb2coYExvYWRpbmcgY29ubmVjdGlvbiBwcm9maWxlIGZyb206ICR7Y2NwUGF0aH1gKTtcclxuICAgIFxyXG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGNjcFBhdGgpKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgQ29ubmVjdGlvbiBwcm9maWxlIG5vdCBmb3VuZCBhdCAke2NjcFBhdGh9YCk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignQ2hlY2tpbmcgZm9yIGFsdGVybmF0aXZlIGxvY2F0aW9ucy4uLicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFRyeSBzb21lIGFsdGVybmF0aXZlIGxvY2F0aW9ucyB0aGF0IG1pZ2h0IGV4aXN0XHJcbiAgICAgICAgY29uc3QgYWx0ZXJuYXRpdmVQYXRocyA9IFtcclxuICAgICAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdjb25uZWN0aW9uLW9yZzEuanNvbicpLFxyXG4gICAgICAgICAgICBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2Nvbm5lY3Rpb24uanNvbicpLFxyXG4gICAgICAgICAgICBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2ZhYnJpYy1zYW1wbGVzJywgJ3Rlc3QtbmV0d29yaycsICdvcmdhbml6YXRpb25zJywgJ3BlZXJPcmdhbml6YXRpb25zJywgJ29yZzEuZXhhbXBsZS5jb20nLCAnY29ubmVjdGlvbi1vcmcxLmpzb24nKVxyXG4gICAgICAgIF07XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChjb25zdCBhbHRQYXRoIG9mIGFsdGVybmF0aXZlUGF0aHMpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYENoZWNraW5nIGFsdGVybmF0aXZlIHBhdGg6ICR7YWx0UGF0aH1gKTtcclxuICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoYWx0UGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBGb3VuZCBhbHRlcm5hdGl2ZSBjb25uZWN0aW9uIHByb2ZpbGUgYXQ6ICR7YWx0UGF0aH1gKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVDb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyhhbHRQYXRoLCAndXRmOCcpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZmlsZUNvbnRlbnRzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbm5lY3Rpb24gcHJvZmlsZSBub3QgZm91bmQgYXQgJHtjY3BQYXRofSBvciBhbnkgYWx0ZXJuYXRpdmUgbG9jYXRpb25zYCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZmlsZUNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKGNjcFBhdGgsICd1dGY4Jyk7XHJcbiAgICAgICAgY29uc3QgY29ubmVjdGlvblByb2ZpbGUgPSBKU09OLnBhcnNlKGZpbGVDb250ZW50cyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVmFsaWRhdGUgdGhlIGNvbm5lY3Rpb24gcHJvZmlsZSBoYXMgcmVxdWlyZWQgc3RydWN0dXJlXHJcbiAgICAgICAgaWYgKCFjb25uZWN0aW9uUHJvZmlsZS5vcmdhbml6YXRpb25zKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQ29ubmVjdGlvbiBwcm9maWxlIG1pc3Npbmcgb3JnYW5pemF0aW9ucyBzZWN0aW9uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghY29ubmVjdGlvblByb2ZpbGUucGVlcnMpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdDb25uZWN0aW9uIHByb2ZpbGUgbWlzc2luZyBwZWVycyBzZWN0aW9uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBjb25uZWN0aW9uUHJvZmlsZTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgbG9hZGluZyBjb25uZWN0aW9uIHByb2ZpbGU6ICR7ZXJyb3J9YCk7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gbG9hZCBjb25uZWN0aW9uIHByb2ZpbGUgZnJvbSAke2NjcFBhdGh9OiAke2Vycm9yfWApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemUgdGhlIGNvbm5lY3Rpb24gdG8gdGhlIEZhYnJpYyBuZXR3b3JrIGFuZCByZXR1cm4gYSBjb250cmFjdFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGluaXRGYWJyaWMgPSBhc3luYyAoKTogUHJvbWlzZTxDb250cmFjdD4gPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyBDcmVhdGUgZ1JQQyBjb25uZWN0aW9uXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGdSUEMgY29ubmVjdGlvbi4uLicpO1xyXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGNyZWF0ZUdycGNDb25uZWN0aW9uKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVHJ5IHRvIGxvYWQgdXNlciBpZGVudGl0eSBhbmQgY2hlY2sgZm9yIGlzc3Vlc1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBDaGVja2luZyBmb3IgaWRlbnRpdHk6ICR7Y29uZmlnLnVzZXJJZH1gKTtcclxuICAgICAgICBjb25zdCB3YWxsZXRQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIGNvbmZpZy53YWxsZXRQYXRoKTtcclxuICAgICAgICBjb25zdCBuZXdGb3JtYXRQYXRoID0gcGF0aC5qb2luKHdhbGxldFBhdGgsIGNvbmZpZy51c2VySWQpO1xyXG4gICAgICAgIGNvbnN0IG9sZEZvcm1hdFBhdGggPSBwYXRoLmpvaW4od2FsbGV0UGF0aCwgYCR7Y29uZmlnLnVzZXJJZH0uaWRgKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBQcmludCBkaWFnbm9zdGljIGluZm8gYWJvdXQgd2FsbGV0IGZpbGVzXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1dhbGxldCBkaWFnbm9zdGljIGluZm9ybWF0aW9uOicpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGAtIFdhbGxldCBkaXJlY3RvcnkgZXhpc3RzOiAke2ZzLmV4aXN0c1N5bmMod2FsbGV0UGF0aCl9YCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYC0gTmV3IGZvcm1hdCBkaXJlY3RvcnkgZXhpc3RzOiAke2ZzLmV4aXN0c1N5bmMobmV3Rm9ybWF0UGF0aCl9YCk7XHJcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMobmV3Rm9ybWF0UGF0aCkpIHtcclxuICAgICAgICAgICAgY29uc3QgY2VydEV4aXN0cyA9IGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKG5ld0Zvcm1hdFBhdGgsICdjZXJ0LnBlbScpKTtcclxuICAgICAgICAgICAgY29uc3Qga2V5RXhpc3RzID0gZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4obmV3Rm9ybWF0UGF0aCwgJ2tleS5wZW0nKSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgIC0gQ2VydGlmaWNhdGUgZXhpc3RzOiAke2NlcnRFeGlzdHN9YCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgIC0gUHJpdmF0ZSBrZXkgZXhpc3RzOiAke2tleUV4aXN0c31gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coYC0gT2xkIGZvcm1hdCBmaWxlIGV4aXN0czogJHtmcy5leGlzdHNTeW5jKG9sZEZvcm1hdFBhdGgpfWApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIElmIG9sZCB3YWxsZXQgZm9ybWF0IGV4aXN0cywgcHJpbnQgbW9yZSBkZXRhaWxzIGFib3V0IGl0XHJcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMob2xkRm9ybWF0UGF0aCkpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlkRGF0YSA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKG9sZEZvcm1hdFBhdGgsICd1dGY4JykpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYC0gT2xkIGZvcm1hdCBpZGVudGl0eSB0eXBlOiAke2lkRGF0YS50eXBlfWApO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYC0gT2xkIGZvcm1hdCBNU1AgSUQ6ICR7aWREYXRhLm1zcElkIHx8ICdOT1QgU0VUJ31gKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAtIEhhcyBjZXJ0aWZpY2F0ZTogJHshIWlkRGF0YS5jcmVkZW50aWFscz8uY2VydGlmaWNhdGV9YCk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgLSBIYXMgcHJpdmF0ZSBrZXk6ICR7ISFpZERhdGEuY3JlZGVudGlhbHM/LnByaXZhdGVLZXl9YCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYC0gQ291bGQgbm90IHJlYWQgb2xkIGZvcm1hdCB3YWxsZXQ6ICR7ZXJyb3J9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gTG9hZCBpZGVudGl0eSBhbmQgc2lnbmVyXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYExvYWRpbmcgaWRlbnRpdHkgZm9yICR7Y29uZmlnLnVzZXJJZH0uLi5gKTtcclxuICAgICAgICAgICAgY29uc3QgaWRlbnRpdHkgPSBhd2FpdCBsb2FkSWRlbnRpdHkoY29uZmlnLnVzZXJJZCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBMb2FkaW5nIHNpZ25lciBmb3IgJHtjb25maWcudXNlcklkfS4uLmApO1xyXG4gICAgICAgICAgICBjb25zdCBzaWduZXIgPSBhd2FpdCBsb2FkU2lnbmVyKGNvbmZpZy51c2VySWQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gU2V0IGRlYWRsaW5lcyBmb3IgdmFyaW91cyBvcGVyYXRpb25zXHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnREYXRlID0gRGF0ZS5ub3coKTtcclxuICAgICAgICAgICAgY29uc3QgcXVlcnlUaW1lb3V0ID0gY3VycmVudERhdGUgKyAoY29uZmlnLnF1ZXJ5VGltZW91dCAqIDEwMDApO1xyXG4gICAgICAgICAgICBjb25zdCBlbmRvcnNlVGltZW91dCA9IGN1cnJlbnREYXRlICsgKGNvbmZpZy5lbmRvcnNlVGltZW91dCAqIDEwMDApO1xyXG4gICAgICAgICAgICBjb25zdCBzdWJtaXRUaW1lb3V0ID0gY3VycmVudERhdGUgKyAoY29uZmlnLnN1Ym1pdFRpbWVvdXQgKiAxMDAwKTtcclxuICAgICAgICAgICAgY29uc3QgY29tbWl0VGltZW91dCA9IGN1cnJlbnREYXRlICsgKGNvbmZpZy5jb21taXRUaW1lb3V0ICogMTAwMCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBDb25uZWN0IHRvIGdhdGV3YXkgd2l0aCBtb3JlIHJvYnVzdCBvcHRpb25zXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0aW5nIHRvIEZhYnJpYyBnYXRld2F5Li4uJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGdhdGV3YXkgPSBhd2FpdCBjb25uZWN0KHtcclxuICAgICAgICAgICAgICAgIGNsaWVudCxcclxuICAgICAgICAgICAgICAgIGlkZW50aXR5LFxyXG4gICAgICAgICAgICAgICAgc2lnbmVyLFxyXG4gICAgICAgICAgICAgICAgLy8gVXNlIHByb3BlciBvcHRpb25zIGJ5IHNwZWNpZnlpbmcgdGhlIGZ1bGwgY2FsbCBvcHRpb25zIG9iamVjdCBcclxuICAgICAgICAgICAgICAgIGV2YWx1YXRlT3B0aW9uczogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWFkbGluZTogcXVlcnlUaW1lb3V0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3YWl0Rm9yUmVhZHk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBlbmRvcnNlT3B0aW9uczogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWFkbGluZTogZW5kb3JzZVRpbWVvdXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhaXRGb3JSZWFkeTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHN1Ym1pdE9wdGlvbnM6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVhZGxpbmU6IHN1Ym1pdFRpbWVvdXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhaXRGb3JSZWFkeTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNvbW1pdFN0YXR1c09wdGlvbnM6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVhZGxpbmU6IGNvbW1pdFRpbWVvdXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhaXRGb3JSZWFkeTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIEZhYnJpYyBnYXRld2F5Jyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBHZXQgbmV0d29yayBhbmQgY29udHJhY3RcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYEdldHRpbmcgbmV0d29yazogJHtjb25maWcuY2hhbm5lbE5hbWV9YCk7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ldHdvcmsgPSBnYXRld2F5LmdldE5ldHdvcmsoY29uZmlnLmNoYW5uZWxOYW1lKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBHZXR0aW5nIGNvbnRyYWN0OiAke2NvbmZpZy5jaGFpbmNvZGVOYW1lfWApO1xyXG4gICAgICAgICAgICBjb25zdCBjb250cmFjdCA9IG5ldHdvcmsuZ2V0Q29udHJhY3QoY29uZmlnLmNoYWluY29kZU5hbWUpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYENvbm5lY3RlZCB0byBuZXR3b3JrOiAke2NvbmZpZy5jaGFubmVsTmFtZX0sIGNvbnRyYWN0OiAke2NvbmZpZy5jaGFpbmNvZGVOYW1lfWApO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gQWRkIGNsZWFudXAgb24gcHJvY2VzcyBleGl0XHJcbiAgICAgICAgICAgIHByb2Nlc3Mub24oJ1NJR1RFUk0nLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2xvc2luZyBnYXRld2F5IGNvbm5lY3Rpb24nKTtcclxuICAgICAgICAgICAgICAgIGdhdGV3YXkuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIGNsaWVudC5jbG9zZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDbG9zaW5nIGdhdGV3YXkgY29ubmVjdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgZ2F0ZXdheS5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgY2xpZW50LmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gVHJ5IHRvIHF1ZXJ5IHRoZSBsZWRnZXIgYXMgYSB0ZXN0XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUZXN0aW5nIGNvbm5lY3Rpb24gd2l0aCBxdWVyeS4uLicpO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY29udHJhY3QuZXZhbHVhdGVUcmFuc2FjdGlvbignR2V0QWxsRG9uYXRpb25zJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVGVzdCBxdWVyeSBzdWNjZXNzZnVsIScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEZvdW5kICR7SlNPTi5wYXJzZShCdWZmZXIuZnJvbShyZXN1bHQpLnRvU3RyaW5nKCkpLmxlbmd0aH0gZG9uYXRpb25zIG9uIHRoZSBsZWRnZXJgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0xlZGdlciBhcHBlYXJzIHRvIGJlIGVtcHR5LCBubyBkb25hdGlvbnMgZm91bmQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAocXVlcnlFcnJvcjogdW5rbm93bikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZXJyTXNnID0gcXVlcnlFcnJvciBpbnN0YW5jZW9mIEVycm9yID8gcXVlcnlFcnJvci5tZXNzYWdlIDogU3RyaW5nKHF1ZXJ5RXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBUZXN0IHF1ZXJ5IGZhaWxlZDogJHtlcnJNc2d9YCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIHNwZWNpZmljIGVycm9yc1xyXG4gICAgICAgICAgICAgICAgaWYgKGVyck1zZy5pbmNsdWRlcygnY3JlYXRvciBvcmcgdW5rbm93bicpIHx8IGVyck1zZy5pbmNsdWRlcygnYWNjZXNzIGRlbmllZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRVJST1I6IElkZW50aXR5IHZhbGlkYXRpb24gZmFpbGVkLiBUaGUgY2VydGlmaWNhdGUgb3IgTVNQIElEIG1heSBiZSBpbmNvcnJlY3QuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGEgbmV3IGlkZW50aXR5IG1heSByZXNvbHZlIHRoaXMgaXNzdWUuJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0aW9uIGFwcGVhcnMgdG8gYmUgd29ya2luZywgYnV0IHF1ZXJ5IGZhaWxlZC4gVGhpcyBtYXkgYmUgbm9ybWFsIGlmIHRoZSBsZWRnZXIgaXMgZW1wdHkuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVHJ5IGluaXRpYWxpemluZyB0aGUgbGVkZ2VyIGlmIG5vdCBhbHJlYWR5IGluaXRpYWxpemVkXHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0F0dGVtcHRpbmcgdG8gaW5pdGlhbGl6ZSB0aGUgbGVkZ2VyLi4uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGNvbnRyYWN0LnN1Ym1pdFRyYW5zYWN0aW9uKCdJbml0TGVkZ2VyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMZWRnZXIgaW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoaW5pdEVycm9yOiB1bmtub3duKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluaXRFcnJNc2cgPSBpbml0RXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGluaXRFcnJvci5tZXNzYWdlIDogU3RyaW5nKGluaXRFcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgTGVkZ2VyIGluaXRpYWxpemF0aW9uIGZhaWxlZDogJHtpbml0RXJyTXNnfWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVGhpcyBtYXkgYmUgbm9ybWFsIGlmIHRoZSBsZWRnZXIgaXMgYWxyZWFkeSBpbml0aWFsaXplZCBvciBpZiBJbml0TGVkZ2VyIGZ1bmN0aW9uIGRvZXMgbm90IGV4aXN0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gY29udHJhY3Q7XHJcbiAgICAgICAgfSBjYXRjaCAoaWRlbnRpdHlFcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBpZGVudGl0eSBvciBjb25uZWN0IHRvIGdhdGV3YXk6JywgaWRlbnRpdHlFcnJvcik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMob2xkRm9ybWF0UGF0aCkgJiYgIWZzLmV4aXN0c1N5bmMobmV3Rm9ybWF0UGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1xcbkVSUk9SOiBVc2VyIGlkZW50aXR5IG5vdCBmb3VuZCBpbiB3YWxsZXQuJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBOZWl0aGVyICR7Y29uZmlnLnVzZXJJZH0uaWQgbm9yICR7Y29uZmlnLnVzZXJJZH0vY2VydC5wZW0gZXhpc3RzLmApO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignXFxuVG8gZml4IHRoaXMgaXNzdWU6Jyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCcxLiBSdW4gZW5yb2xsQWRtaW4udHMgdG8gY3JlYXRlIGFkbWluIGNyZWRlbnRpYWxzJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCcyLiBSdW4gcmVnaXN0ZXJVc2VyLnRzIHRvIGNyZWF0ZSB1c2VyIGNyZWRlbnRpYWxzJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcXG5UcnkgcnVubmluZzogbnBtIHJ1biBlbnJvbGwtYWRtaW4gJiYgbnBtIHJ1biByZWdpc3Rlci11c2VyJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZnMuZXhpc3RzU3luYyhvbGRGb3JtYXRQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBUcnkgdG8gcHJvdmlkZSBkaWFnbm9zdGljIGluZm8gYWJvdXQgdGhlIG9sZCBmb3JtYXQgaWRlbnRpdHlcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZENvbnRlbnQgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhvbGRGb3JtYXRQYXRoLCAndXRmOCcpKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcXG5Gb3VuZCBvbGQgZm9ybWF0IGlkZW50aXR5IGZpbGUgYnV0IGNvdWxkblxcJ3QgdXNlIGl0LicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYC0gSGFzIGNlcnRpZmljYXRlOiAkeyEhaWRDb250ZW50Py5jcmVkZW50aWFscz8uY2VydGlmaWNhdGV9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgLSBIYXMgcHJpdmF0ZSBrZXk6ICR7ISFpZENvbnRlbnQ/LmNyZWRlbnRpYWxzPy5wcml2YXRlS2V5fWApO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYC0gTVNQIElEOiAke2lkQ29udGVudD8ubXNwSWQgfHwgJ05vdCBmb3VuZCd9YCk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChyZWFkRXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciByZWFkaW5nIGlkZW50aXR5IGZpbGU6ICR7cmVhZEVycm9yfWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBpbml0aWFsaXplIEZhYnJpYyBjb25uZWN0aW9uOiAke2lkZW50aXR5RXJyb3J9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gaW5pdGlhbGl6ZSBGYWJyaWMgY29ubmVjdGlvbjonLCBlcnJvcik7XHJcbiAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRXZhbHVhdGUgYSB0cmFuc2FjdGlvbiAocXVlcnkpXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZXZhbHVhdGVUcmFuc2FjdGlvbiA9IGFzeW5jIChcclxuICAgIGNvbnRyYWN0OiBDb250cmFjdCxcclxuICAgIHRyYW5zYWN0aW9uTmFtZTogc3RyaW5nLFxyXG4gICAgLi4udHJhbnNhY3Rpb25BcmdzOiBzdHJpbmdbXVxyXG4pOiBQcm9taXNlPFVpbnQ4QXJyYXk+ID0+IHtcclxuICAgIGNvbnNvbGUubG9nKGBFdmFsdWF0aW5nIHRyYW5zYWN0aW9uOiAke3RyYW5zYWN0aW9uTmFtZX1gKTtcclxuICAgIFxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjb250cmFjdC5ldmFsdWF0ZVRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uTmFtZSwgLi4udHJhbnNhY3Rpb25BcmdzKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgVHJhbnNhY3Rpb24gJHt0cmFuc2FjdGlvbk5hbWV9IGV2YWx1YXRlZCBzdWNjZXNzZnVsbHlgKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBldmFsdWF0aW5nIHRyYW5zYWN0aW9uICR7dHJhbnNhY3Rpb25OYW1lfTpgLCBlcnJvcik7XHJcbiAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogU3VibWl0IGEgdHJhbnNhY3Rpb24gKHVwZGF0ZSlcclxuICovXHJcbmV4cG9ydCBjb25zdCBzdWJtaXRUcmFuc2FjdGlvbiA9IGFzeW5jIChcclxuICAgIGNvbnRyYWN0OiBDb250cmFjdCxcclxuICAgIHRyYW5zYWN0aW9uTmFtZTogc3RyaW5nLFxyXG4gICAgLi4udHJhbnNhY3Rpb25BcmdzOiBzdHJpbmdbXVxyXG4pOiBQcm9taXNlPFVpbnQ4QXJyYXk+ID0+IHtcclxuICAgIGNvbnNvbGUubG9nKGBTdWJtaXR0aW5nIHRyYW5zYWN0aW9uOiAke3RyYW5zYWN0aW9uTmFtZX1gKTtcclxuICAgIFxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjb250cmFjdC5zdWJtaXRUcmFuc2FjdGlvbih0cmFuc2FjdGlvbk5hbWUsIC4uLnRyYW5zYWN0aW9uQXJncyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFRyYW5zYWN0aW9uICR7dHJhbnNhY3Rpb25OYW1lfSBzdWJtaXR0ZWQgc3VjY2Vzc2Z1bGx5YCk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3Igc3VibWl0dGluZyB0cmFuc2FjdGlvbiAke3RyYW5zYWN0aW9uTmFtZX06YCwgZXJyb3IpO1xyXG4gICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgfVxyXG59OyAiXX0=