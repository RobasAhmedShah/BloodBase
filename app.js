const { Gateway, connect } = require('@hyperledger/fabric-gateway');
const grpc = require('@grpc/grpc-js');
const { credentials } = require('@grpc/grpc-js');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { signers } = require('@hyperledger/fabric-gateway');
const config = require('./config');

async function newGrpcConnection() {
    const tlsRootCert = await fs.promises.readFile(config.tlsCertPath);
    const tlsCredentials = credentials.createSsl(tlsRootCert);
    return new grpc.Client(config.peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': config.peerHostAlias,
    });
}

async function newIdentity() {
    const certPath = path.join(config.certDirectoryPath, 'cert.pem');
    const credentials = await fs.promises.readFile(certPath);
    return { mspId: config.mspId, credentials };
}

async function newSigner() {
    const keyPath = path.join(config.keyDirectoryPath, '4d552f349e82462cbd391c0d8caaaed4c4c93ecc7554ec4fc36d2a6e4001604a_sk');
    const privateKeyPem = await fs.promises.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

function bufferToJson(buffer) {
    // Convert buffer to string of ASCII codes
    const asciiString = buffer.toString();
    // Split by commas and convert each ASCII code to character
    const chars = asciiString.split(',').map(code => String.fromCharCode(parseInt(code)));
    // Join characters and parse as JSON
    return JSON.parse(chars.join(''));
}

async function main() {
    let gateway;
    try {
        const client = await newGrpcConnection();
        gateway = connect({
            client,
            identity: await newIdentity(),
            signer: await newSigner(),
            hash: (data) => crypto.createHash('sha256').update(data).digest(),
        });

        // Get the network and contract
        const network = gateway.getNetwork(config.channelName);
        const contract = network.getContract(config.chaincodeName);

        // Create a new asset
        console.log('\n--> Submit Transaction: CreateAsset');
        await contract.submitTransaction(
            'CreateAsset',
            'asset500',
            'green',
            '90',
            'CustomOwner',
            '5000'
        );
        console.log('*** Transaction committed successfully');

        // Query all assets
        console.log('\n--> Evaluate Transaction: GetAllAssets');
        const result = await contract.evaluateTransaction('GetAllAssets');
        try {
            const assets = bufferToJson(result);
            console.log('*** Result:', assets);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            console.log('Raw result:', result.toString());
        }

        // Transfer an asset
        console.log('\n--> Submit Transaction: TransferAsset');
        const commit = await contract.submitAsync('TransferAsset', {
            arguments: ['asset200', 'NewOwner'],
        });
        console.log('*** Transaction submitted successfully');
        
        const status = await commit.getStatus();
        if (!status.successful) {
            throw new Error(`Transaction ${status.transactionId} failed to commit with status code ${status.code}`);
        }
        console.log('*** Transaction committed successfully');

        // Query the transferred asset
        console.log('\n--> Evaluate Transaction: ReadAsset');
        const assetResult = await contract.evaluateTransaction('ReadAsset', 'asset200');
        try {
            const asset = bufferToJson(assetResult);
            console.log('*** Result:', asset);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            console.log('Raw result:', assetResult.toString());
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (gateway) {
            gateway.close();
        }
    }
}

main().catch(console.error); 