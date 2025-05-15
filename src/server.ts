/*
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';
import cors from 'cors';
import * as config from './config';

// Import router files
import { donationsRouter } from './routes/donations.router';
import { donorsRouter } from './routes/donors.router';
import { appointmentsRouter } from './routes/appointments.router';
import { patientsRouter } from './routes/patients.router';
import { healthRouter } from './routes/health.router';

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = StatusCodes;

/**
 * Create and configure Express server
 */
export const createServer = async (): Promise<Application> => {
    const app = express();

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Configure CORS
    const corsOptions = {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    };
    app.use(cors(corsOptions));

    // Security middleware
    if (process.env.NODE_ENV === 'production') {
        app.use(helmet());
    }

    // API routes
    app.use('/health', healthRouter);
    app.use(`${config.baseApiPath}/donations`, donationsRouter);
    app.use(`${config.baseApiPath}/donors`, donorsRouter);
    app.use(`${config.baseApiPath}/appointments`, appointmentsRouter);
    app.use(`${config.baseApiPath}/patients`, patientsRouter);

    // For everything else
    app.use((_req, res) => {
        return res.status(NOT_FOUND).json({
            status: 'Not Found',
            message: 'Requested resource not found',
            timestamp: new Date().toISOString()
        });
    });

    // Generic error handler
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        console.error('Unhandled error:', err);
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: 'Internal Server Error',
            message: 'An unexpected error occurred',
            timestamp: new Date().toISOString()
        });
    });

    return app;
}; 