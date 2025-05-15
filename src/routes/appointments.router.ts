/*
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Contract } from '@hyperledger/fabric-gateway';
import { evaluateTransaction } from '../fabric';

const { OK, INTERNAL_SERVER_ERROR } = StatusCodes;

export const appointmentsRouter = express.Router();

/**
 * Get all appointments
 */
appointmentsRouter.get('/', async (req: Request, res: Response) => {
    console.log('Get all appointments request received');
    
    try {
        const contract = req.app.locals.contract as Contract;
        
        const result = await evaluateTransaction(contract, 'GetAllAppointments');
        const appointments = JSON.parse(Buffer.from(result).toString());
        
        return res.status(OK).json(appointments);
    } catch (error: any) {
        console.error('Error getting all appointments:', error);
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: 'Internal Server Error',
            message: error?.message || 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
}); 