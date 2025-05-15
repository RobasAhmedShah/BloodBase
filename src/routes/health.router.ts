/*
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Contract } from '@hyperledger/fabric-gateway';
import { evaluateTransaction } from '../fabric';
import * as fs from 'fs';
import * as path from 'path';
import * as config from '../config';

const { OK, SERVICE_UNAVAILABLE } = StatusCodes;

export const healthRouter = express.Router();

/**
 * Health check endpoint that verifies connection to the blockchain network
 */
healthRouter.get('/', async (req: Request, res: Response) => {
    console.log('Health check request received');
    
    const contract = req.app.locals.contract as Contract;
    
    if (!contract) {
        console.error('Health check failed: No contract in app locals');
        return res.status(SERVICE_UNAVAILABLE).json({
            status: 'Service Unavailable',
            message: 'Not connected to blockchain network',
            timestamp: new Date().toISOString()
        });
    }
    
    try {
        // Try to call GetAllDonations function as a simple test
        console.log('Executing health check query...');
        const result = await evaluateTransaction(contract, 'GetAllDonations');
        const donations = JSON.parse(Buffer.from(result).toString());
        
        console.log(`Health check successful! Found ${donations.length} donations`);
        return res.status(OK).json({
            status: 'OK',
            message: 'API is running and connected to blockchain network',
            fabric: {
                connected: true,
                donations: donations.length
            },
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Health check query failed:', error);
        
        // Check for common errors and provide helpful diagnostics
        let errorType = 'Unknown error';
        let solution = 'Check network connectivity and blockchain status';
        
        if (error?.code === 4) {
            errorType = 'Timeout';
            solution = 'The network is not responding within the timeout period. Increase timeout values in config.ts.';
        } else if (error?.code === 14) {
            errorType = 'Unavailable';
            solution = 'The blockchain network is currently unavailable. Check if the Fabric network is running.';
        } else if (error?.details?.includes?.('chaincode')) {
            errorType = 'Chaincode error';
            solution = 'The chaincode returned an error. Check if the chaincode is properly deployed.';
        }
        
        // Check wallet status for additional diagnostics
        const walletPath = path.join(process.cwd(), config.walletPath);
        const walletExists = fs.existsSync(walletPath);
        const userIdentityExists = fs.existsSync(path.join(walletPath, config.userId)) || 
                                  fs.existsSync(path.join(walletPath, `${config.userId}.id`));
        
        return res.status(SERVICE_UNAVAILABLE).json({
            status: 'Service Unavailable',
            message: 'Connected to network but contract call failed',
            errorType,
            solution,
            error: error?.message || 'Unknown error',
            diagnostics: {
                walletExists,
                userIdentityExists,
                connectionProfileExists: true,
                networkConfig: {
                    channel: config.channelName,
                    chaincode: config.chaincodeName
                }
            },
            timestamp: new Date().toISOString()
        });
    }
}); 