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
const config = __importStar(require("./config"));
const fabric_1 = require("./fabric");
const server_1 = require("./server");
/**
 * Main application entry point
 */
async function main() {
    let contract;
    try {
        console.log('Starting BloodBase API server...');
        // Connect to Fabric network
        console.log('Connecting to Fabric network...');
        contract = await (0, fabric_1.initFabric)();
        console.log('Successfully connected to Fabric network');
        // Create and configure Express server
        console.log('Creating REST server...');
        const app = await (0, server_1.createServer)();
        // Store contract in app locals for use in routes
        app.locals.contract = contract;
        // Start server
        app.listen(config.port, () => {
            console.log(`BloodBase API server started on ${config.host}:${config.port}`);
            console.log(`Health endpoint: http://${config.host}:${config.port}/health`);
            console.log(`API Base URL: http://${config.host}:${config.port}${config.baseApiPath}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    process.exit(0);
});
// Start the application
main().catch(err => {
    console.error('Unhandled error in main application:', err);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdILGlEQUFtQztBQUNuQyxxQ0FBc0M7QUFDdEMscUNBQXdDO0FBRXhDOztHQUVHO0FBQ0gsS0FBSyxVQUFVLElBQUk7SUFDZixJQUFJLFFBQThCLENBQUM7SUFFbkMsSUFBSSxDQUFDO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1FBRWhELDRCQUE0QjtRQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDL0MsUUFBUSxHQUFHLE1BQU0sSUFBQSxtQkFBVSxHQUFFLENBQUM7UUFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBRXhELHNDQUFzQztRQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDdkMsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFBLHFCQUFZLEdBQUUsQ0FBQztRQUVqQyxpREFBaUQ7UUFDakQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBRS9CLGVBQWU7UUFDZixHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDN0UsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQztZQUM1RSxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDM0YsQ0FBQyxDQUFDLENBQUM7SUFFUCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQixDQUFDO0FBQ0wsQ0FBQztBQUVELDJCQUEyQjtBQUMzQixPQUFPLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7SUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0lBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsQ0FBQyxDQUFDLENBQUM7QUFFSCx3QkFBd0I7QUFDeEIsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcclxuICovXHJcblxyXG5pbXBvcnQgeyBDb250cmFjdCB9IGZyb20gJ0BoeXBlcmxlZGdlci9mYWJyaWMtZ2F0ZXdheSc7XHJcbmltcG9ydCAqIGFzIGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XHJcbmltcG9ydCB7IGluaXRGYWJyaWMgfSBmcm9tICcuL2ZhYnJpYyc7XHJcbmltcG9ydCB7IGNyZWF0ZVNlcnZlciB9IGZyb20gJy4vc2VydmVyJztcclxuXHJcbi8qKlxyXG4gKiBNYWluIGFwcGxpY2F0aW9uIGVudHJ5IHBvaW50XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBtYWluKCkge1xyXG4gICAgbGV0IGNvbnRyYWN0OiBDb250cmFjdCB8IHVuZGVmaW5lZDtcclxuICAgIFxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnU3RhcnRpbmcgQmxvb2RCYXNlIEFQSSBzZXJ2ZXIuLi4nKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBDb25uZWN0IHRvIEZhYnJpYyBuZXR3b3JrXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RpbmcgdG8gRmFicmljIG5ldHdvcmsuLi4nKTtcclxuICAgICAgICBjb250cmFjdCA9IGF3YWl0IGluaXRGYWJyaWMoKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnU3VjY2Vzc2Z1bGx5IGNvbm5lY3RlZCB0byBGYWJyaWMgbmV0d29yaycpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIENyZWF0ZSBhbmQgY29uZmlndXJlIEV4cHJlc3Mgc2VydmVyXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIFJFU1Qgc2VydmVyLi4uJyk7XHJcbiAgICAgICAgY29uc3QgYXBwID0gYXdhaXQgY3JlYXRlU2VydmVyKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gU3RvcmUgY29udHJhY3QgaW4gYXBwIGxvY2FscyBmb3IgdXNlIGluIHJvdXRlc1xyXG4gICAgICAgIGFwcC5sb2NhbHMuY29udHJhY3QgPSBjb250cmFjdDtcclxuICAgICAgICBcclxuICAgICAgICAvLyBTdGFydCBzZXJ2ZXJcclxuICAgICAgICBhcHAubGlzdGVuKGNvbmZpZy5wb3J0LCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBCbG9vZEJhc2UgQVBJIHNlcnZlciBzdGFydGVkIG9uICR7Y29uZmlnLmhvc3R9OiR7Y29uZmlnLnBvcnR9YCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBIZWFsdGggZW5kcG9pbnQ6IGh0dHA6Ly8ke2NvbmZpZy5ob3N0fToke2NvbmZpZy5wb3J0fS9oZWFsdGhgKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYEFQSSBCYXNlIFVSTDogaHR0cDovLyR7Y29uZmlnLmhvc3R9OiR7Y29uZmlnLnBvcnR9JHtjb25maWcuYmFzZUFwaVBhdGh9YCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzdGFydCBzZXJ2ZXI6JywgZXJyb3IpO1xyXG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gSGFuZGxlIGdyYWNlZnVsIHNodXRkb3duXHJcbnByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdcXG5TaHV0dGluZyBkb3duIGdyYWNlZnVsbHkuLi4nKTtcclxuICAgIHByb2Nlc3MuZXhpdCgwKTtcclxufSk7XHJcblxyXG4vLyBTdGFydCB0aGUgYXBwbGljYXRpb25cclxubWFpbigpLmNhdGNoKGVyciA9PiB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdVbmhhbmRsZWQgZXJyb3IgaW4gbWFpbiBhcHBsaWNhdGlvbjonLCBlcnIpO1xyXG4gICAgcHJvY2Vzcy5leGl0KDEpO1xyXG59KTsgIl19