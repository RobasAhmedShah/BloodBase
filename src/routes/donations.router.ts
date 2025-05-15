/*
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { Contract } from '@hyperledger/fabric-gateway';
import { evaluateTransaction, submitTransaction } from '../fabric';

const { OK, CREATED, BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = StatusCodes;

export const donationsRouter = express.Router();

/**
 * Get all donations
 */
donationsRouter.get('/', async (req: Request, res: Response) => {
    console.log('Get all donations request received');
    
    try {
        const contract = req.app.locals.contract as Contract;
        
        const result = await evaluateTransaction(contract, 'GetAllDonations');
        const donations = JSON.parse(Buffer.from(result).toString());
        
        return res.status(OK).json(donations);
    } catch (error: any) {
        console.error('Error getting all donations:', error);
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: 'Internal Server Error',
            message: error?.message || 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Create a new donation
 */
donationsRouter.post(
    '/',
    [
        body('id').isString().notEmpty().withMessage('Donation ID is required'),
        body('donorID').isString().notEmpty().withMessage('Donor ID is required'),
        body('bloodType').isString().notEmpty().withMessage('Blood type is required'),
        body('timestamp').isString().notEmpty().withMessage('Timestamp is required')
    ],
    async (req: Request, res: Response) => {
        console.log('Create donation request received:', req.body);
        
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(BAD_REQUEST).json({
                status: 'Bad Request',
                errors: errors.array(),
                timestamp: new Date().toISOString()
            });
        }
        
        try {
            const contract = req.app.locals.contract as Contract;
            const { id, donorID, bloodType, timestamp } = req.body;
            
            // Check if donation already exists
            try {
                const existsResult = await evaluateTransaction(contract, 'DonationExists', id);
                const exists = Buffer.from(existsResult).toString() === 'true';
                if (exists) {
                    return res.status(BAD_REQUEST).json({
                        status: 'Bad Request',
                        message: `Donation with ID ${id} already exists`,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (checkError: any) {
                console.error('Error checking if donation exists:', checkError);
                // Continue if error occurs during existence check
            }
            
            // Create the donation
            await submitTransaction(contract, 'CreateDonation', id, donorID, bloodType, timestamp);
            
            return res.status(CREATED).json({
                status: 'Created',
                message: 'Donation created successfully',
                id,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('Error creating donation:', error);
            return res.status(INTERNAL_SERVER_ERROR).json({
                status: 'Internal Server Error',
                message: error?.message || 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
);

/**
 * Get a specific donation by ID
 */
donationsRouter.get(
    '/:id',
    [
        param('id').isString().notEmpty().withMessage('Donation ID is required')
    ],
    async (req: Request, res: Response) => {
        console.log(`Get donation request received for ID: ${req.params.id}`);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(BAD_REQUEST).json({
                status: 'Bad Request',
                errors: errors.array(),
                timestamp: new Date().toISOString()
            });
        }
        
        try {
            const contract = req.app.locals.contract as Contract;
            const id = req.params.id;
            
            try {
                const result = await evaluateTransaction(contract, 'ReadDonation', id);
                const donation = JSON.parse(Buffer.from(result).toString());
                
                return res.status(OK).json(donation);
            } catch (readError: any) {
                // Check if donation not found
                if (readError?.message && readError.message.includes('does not exist')) {
                    return res.status(NOT_FOUND).json({
                        status: 'Not Found',
                        message: `Donation with ID ${id} not found`,
                        timestamp: new Date().toISOString()
                    });
                }
                
                throw readError;
            }
        } catch (error: any) {
            console.error(`Error getting donation with ID ${req.params.id}:`, error);
            return res.status(INTERNAL_SERVER_ERROR).json({
                status: 'Internal Server Error',
                message: error?.message || 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
);

/**
 * Update donation status
 */
donationsRouter.put(
    '/:id/status',
    [
        param('id').isString().notEmpty().withMessage('Donation ID is required'),
        body('status').isString().notEmpty().withMessage('Status is required')
    ],
    async (req: Request, res: Response) => {
        console.log(`Update donation status request received for ID: ${req.params.id}`);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(BAD_REQUEST).json({
                status: 'Bad Request',
                errors: errors.array(),
                timestamp: new Date().toISOString()
            });
        }
        
        try {
            const contract = req.app.locals.contract as Contract;
            const id = req.params.id;
            const { status } = req.body;
            
            // Check if donation exists first
            try {
                const existsResult = await evaluateTransaction(contract, 'DonationExists', id);
                const exists = Buffer.from(existsResult).toString() === 'true';
                if (!exists) {
                    return res.status(NOT_FOUND).json({
                        status: 'Not Found',
                        message: `Donation with ID ${id} not found`,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (checkError: any) {
                console.error('Error checking if donation exists:', checkError);
                // Continue if error occurs during existence check
            }
            
            // Update donation status
            await submitTransaction(contract, 'UpdateDonationStatus', id, status);
            
            return res.status(OK).json({
                status: 'OK',
                message: `Donation ${id} status updated to ${status}`,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error(`Error updating donation status for ID ${req.params.id}:`, error);
            return res.status(INTERNAL_SERVER_ERROR).json({
                status: 'Internal Server Error',
                message: error?.message || 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
);

/**
 * Delete a donation
 */
donationsRouter.delete(
    '/:id',
    [
        param('id').isString().notEmpty().withMessage('Donation ID is required')
    ],
    async (req: Request, res: Response) => {
        console.log(`Delete donation request received for ID: ${req.params.id}`);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(BAD_REQUEST).json({
                status: 'Bad Request',
                errors: errors.array(),
                timestamp: new Date().toISOString()
            });
        }
        
        try {
            const contract = req.app.locals.contract as Contract;
            const id = req.params.id;
            
            // Check if donation exists first
            try {
                const existsResult = await evaluateTransaction(contract, 'DonationExists', id);
                const exists = Buffer.from(existsResult).toString() === 'true';
                if (!exists) {
                    return res.status(NOT_FOUND).json({
                        status: 'Not Found',
                        message: `Donation with ID ${id} not found`,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (checkError: any) {
                console.error('Error checking if donation exists:', checkError);
                // Continue if error occurs during existence check
            }
            
            // Delete the donation
            await submitTransaction(contract, 'DeleteDonation', id);
            
            return res.status(OK).json({
                status: 'OK',
                message: `Donation ${id} deleted successfully`,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error(`Error deleting donation with ID ${req.params.id}:`, error);
            return res.status(INTERNAL_SERVER_ERROR).json({
                status: 'Internal Server Error',
                message: error?.message || 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
);

/**
 * Check if a donation exists
 */
donationsRouter.get(
    '/:id/exists',
    [
        param('id').isString().notEmpty().withMessage('Donation ID is required')
    ],
    async (req: Request, res: Response) => {
        console.log(`Check donation exists request received for ID: ${req.params.id}`);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(BAD_REQUEST).json({
                status: 'Bad Request',
                errors: errors.array(),
                timestamp: new Date().toISOString()
            });
        }
        
        try {
            const contract = req.app.locals.contract as Contract;
            const id = req.params.id;
            
            const existsResult = await evaluateTransaction(contract, 'DonationExists', id);
            const exists = Buffer.from(existsResult).toString() === 'true';
            
            return res.status(OK).json({
                status: 'OK',
                exists,
                id,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error(`Error checking if donation exists with ID ${req.params.id}:`, error);
            return res.status(INTERNAL_SERVER_ERROR).json({
                status: 'Internal Server Error',
                message: error?.message || 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
); 