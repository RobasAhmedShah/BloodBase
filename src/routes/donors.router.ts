/*
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Contract } from '@hyperledger/fabric-gateway';
import { evaluateTransaction } from '../fabric';

const { OK, INTERNAL_SERVER_ERROR } = StatusCodes;

export const donorsRouter = express.Router();

/**
 * Get all donors
 */
donorsRouter.get('/', async (req: Request, res: Response) => {
    console.log('Get all donors request received');
    
    try {
        const contract = req.app.locals.contract as Contract;
        
        const result = await evaluateTransaction(contract, 'GetAllDonors');
        const donors = JSON.parse(Buffer.from(result).toString());
        
        return res.status(OK).json(donors);
    } catch (error: any) {
        console.error('Error getting all donors:', error);
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: 'Internal Server Error',
            message: error?.message || 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
}); 