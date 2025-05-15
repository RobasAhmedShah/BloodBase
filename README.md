# BloodBase API

A TypeScript-based REST API for the BloodBase Hyperledger Fabric blockchain application, using the modern Fabric Gateway SDK.

## Overview

This API provides a RESTful interface to interact with the BloodBase smart contract running on a Hyperledger Fabric blockchain network. It allows various operations for managing blood donations, donors, appointments, and patients. This implementation uses the modern @hyperledger/fabric-gateway SDK approach for improved performance and reliability.

## Prerequisites

- Node.js v14+ and npm
- Running Hyperledger Fabric network (v2.4+) with the BloodBase chaincode deployed
- Access to Fabric network connection profile and credentials
- gRPC endpoint access to the Fabric peers

## Technology Stack

- TypeScript + Node.js
- Express.js for the REST API
- @hyperledger/fabric-gateway SDK for blockchain interaction
- Fabric CA Client for identity management

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Set up wallet identities (one-time setup):
   ```
   npm run enroll-admin    # First enroll admin
   npm run register-user   # Then register app user
   ```
   Alternatively, run both in sequence:
   ```
   npm run setup
   ```

3. Test your connection to the Fabric network:
   ```
   npm run test-connection
   ```

4. Build the TypeScript code:
   ```
   npm run build
   ```

5. Start the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

## Troubleshooting

If you encounter connection issues with the Fabric network:

1. Verify that the Fabric network is running:
   ```
   cd fabric-samples/test-network
   ./network.sh status
   ```

2. Check the connection profile path in your environment variables or config.ts
   The default path is: `fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json`

3. Ensure wallet identities exist by running:
   ```
   npm run test-connection
   ```

4. Check TLS certificate paths in your connection profile. The Fabric Gateway SDK requires valid TLS certificates.

5. Verify the gRPC endpoint is accessible from your environment.

## Environment Variables

The following environment variables can be set to configure the API:

- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: localhost)
- `CHANNEL_NAME`: Fabric channel name (default: mychannel)
- `CHAINCODE_NAME`: Chaincode name (default: bloodbase)
- `MSP_ID`: MSP ID (default: Org1MSP)
- `FABRIC_USER_ID`: Fabric user ID (default: appUser)
- `WALLET_PATH`: Path to wallet directory (default: wallet)
- `CONNECTION_PROFILE_PATH`: Path to connection profile (default: fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json)
- `AS_LOCALHOST`: Use localhost for connections (default: true)
- `LOG_LEVEL`: Logging level (default: info)
- `QUERY_TIMEOUT`: Timeout for query operations in seconds (default: 30)
- `ENDORSE_TIMEOUT`: Timeout for endorse operations in seconds (default: 30)
- `SUBMIT_TIMEOUT`: Timeout for submit operations in seconds (default: 30)
- `COMMIT_TIMEOUT`: Timeout for commit operations in seconds (default: 300)

## API Endpoints

### Health Check
- `GET /health`: Check API and blockchain connection status

### Donations
- `GET /api/v1/donations`: Get all donations
- `POST /api/v1/donations`: Create a new donation
- `GET /api/v1/donations/:id`: Get a specific donation
- `PUT /api/v1/donations/:id/status`: Update donation status
- `DELETE /api/v1/donations/:id`: Delete a donation
- `GET /api/v1/donations/:id/exists`: Check if donation exists

### Donors
- `GET /api/v1/donors`: Get all donors
(More endpoints to be implemented)

### Appointments
- `GET /api/v1/appointments`: Get all appointments
(More endpoints to be implemented)

### Patients
- `GET /api/v1/patients`: Get all patients
(More endpoints to be implemented)

## Directory Structure

```
├── src/                # TypeScript source files
│   ├── config.ts       # Configuration settings
│   ├── fabric.ts       # Fabric Gateway connection utilities
│   ├── index.ts        # Main application entry point
│   ├── server.ts       # Express server setup
│   ├── enrollAdmin.ts  # Admin user enrollment script
│   ├── registerUser.ts # Application user registration script
│   └── routes/         # API route definitions
│       ├── health.router.ts
│       ├── donations.router.ts
│       ├── donors.router.ts
│       ├── appointments.router.ts
│       └── patients.router.ts
├── dist/               # Compiled JavaScript files (generated)
├── wallet/             # Stores identities for Fabric network access
├── package.json        # Project dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## About Fabric Gateway SDK

This API uses the new Fabric Gateway client introduced in Fabric v2.4+. Key improvements include:

1. **Simplified Architecture**: Uses fewer network connections and resources
2. **Improved Performance**: More efficient interaction with the blockchain network
3. **Better Error Handling**: More consistent error reporting and recovery
4. **TypeScript Support**: Built with TypeScript for better type safety
5. **Modern Async API**: Uses modern async/await patterns for cleaner code

The Gateway client manages:
- Connecting to the network using gRPC
- Identity and signing operations
- Transaction submission, evaluation, and endorsement
- Smart contract interaction

## License

This project is licensed under the Apache-2.0 License. 