/*
 * SPDX-License-Identifier: Apache-2.0
 */

import FabricCAServices from 'fabric-ca-client';
import * as fs from 'fs';
import * as path from 'path';
import * as config from './config';

/**
 * Enroll the admin user and store the certificate and private key for use with the Fabric Gateway
 */
async function main() {
    try {
        // Load the connection profile
        const ccpPath = path.resolve(process.cwd(), config.connectionProfilePath);
        const fileExists = fs.existsSync(ccpPath);
        if (!fileExists) {
            throw new Error(`Connection profile does not exist at ${ccpPath}`);
        }
        
        const contents = fs.readFileSync(ccpPath, 'utf8');
        const ccp = JSON.parse(contents);

        // Create a new CA client for interacting with the CA
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { 
            trustedRoots: caTLSCACerts, 
            verify: false 
        }, caInfo.caName);

        // Create directories for storing identity credentials
        const walletPath = path.join(process.cwd(), config.walletPath);
        const adminPath = path.join(walletPath, 'admin');
        
        // Check if admin directory already exists
        if (fs.existsSync(path.join(adminPath, 'cert.pem')) && 
            fs.existsSync(path.join(adminPath, 'key.pem'))) {
            console.log('An identity for the admin user "admin" already exists');
            return;
        }

        // Create directories if they don't exist
        if (!fs.existsSync(walletPath)) {
            fs.mkdirSync(walletPath, { recursive: true });
        }
        
        if (!fs.existsSync(adminPath)) {
            fs.mkdirSync(adminPath, { recursive: true });
        }

        // Enroll the admin user
        console.log('Enrolling admin user...');
        const enrollment = await ca.enroll({ 
            enrollmentID: 'admin', 
            enrollmentSecret: 'adminpw' 
        });
        
        // Write certificate and private key to files
        fs.writeFileSync(path.join(adminPath, 'cert.pem'), enrollment.certificate);
        fs.writeFileSync(path.join(adminPath, 'key.pem'), enrollment.key.toBytes());
        
        // Write a metadata file with MSP information
        const metadata = {
            mspId: config.mspId,
            type: 'X.509'
        };
        
        fs.writeFileSync(
            path.join(adminPath, 'metadata.json'), 
            JSON.stringify(metadata, null, 2)
        );
        
        console.log('Successfully enrolled admin user "admin" and stored credentials');

    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}

main(); 