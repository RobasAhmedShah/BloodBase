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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const fabric_1 = require("../fabric");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config = __importStar(require("../config"));
const { OK, SERVICE_UNAVAILABLE } = http_status_codes_1.StatusCodes;
exports.healthRouter = express_1.default.Router();
/**
 * Health check endpoint that verifies connection to the blockchain network
 */
exports.healthRouter.get('/', async (req, res) => {
    console.log('Health check request received');
    const contract = req.app.locals.contract;
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
        const result = await (0, fabric_1.evaluateTransaction)(contract, 'GetAllDonations');
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
    }
    catch (error) {
        console.error('Health check query failed:', error);
        // Check for common errors and provide helpful diagnostics
        let errorType = 'Unknown error';
        let solution = 'Check network connectivity and blockchain status';
        if (error?.code === 4) {
            errorType = 'Timeout';
            solution = 'The network is not responding within the timeout period. Increase timeout values in config.ts.';
        }
        else if (error?.code === 14) {
            errorType = 'Unavailable';
            solution = 'The blockchain network is currently unavailable. Check if the Fabric network is running.';
        }
        else if (error?.details?.includes?.('chaincode')) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhbHRoLnJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXMvaGVhbHRoLnJvdXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILHNEQUFxRDtBQUNyRCx5REFBZ0Q7QUFFaEQsc0NBQWdEO0FBQ2hELHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0Isa0RBQW9DO0FBRXBDLE1BQU0sRUFBRSxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsR0FBRywrQkFBVyxDQUFDO0FBRW5DLFFBQUEsWUFBWSxHQUFHLGlCQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFN0M7O0dBRUc7QUFDSCxvQkFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQVksRUFBRSxHQUFhLEVBQUUsRUFBRTtJQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUM7SUFFN0MsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBb0IsQ0FBQztJQUVyRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDWixPQUFPLENBQUMsS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7UUFDaEUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3hDLE1BQU0sRUFBRSxxQkFBcUI7WUFDN0IsT0FBTyxFQUFFLHFDQUFxQztZQUM5QyxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7U0FDdEMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELElBQUksQ0FBQztRQUNELHdEQUF3RDtRQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDL0MsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLDRCQUFtQixFQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRTdELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLFNBQVMsQ0FBQyxNQUFNLFlBQVksQ0FBQyxDQUFDO1FBQzVFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDdkIsTUFBTSxFQUFFLElBQUk7WUFDWixPQUFPLEVBQUUsb0RBQW9EO1lBQzdELE1BQU0sRUFBRTtnQkFDSixTQUFTLEVBQUUsSUFBSTtnQkFDZixTQUFTLEVBQUUsU0FBUyxDQUFDLE1BQU07YUFDOUI7WUFDRCxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7U0FDdEMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7UUFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVuRCwwREFBMEQ7UUFDMUQsSUFBSSxTQUFTLEdBQUcsZUFBZSxDQUFDO1FBQ2hDLElBQUksUUFBUSxHQUFHLGtEQUFrRCxDQUFDO1FBRWxFLElBQUksS0FBSyxFQUFFLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNwQixTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQ3RCLFFBQVEsR0FBRyxnR0FBZ0csQ0FBQztRQUNoSCxDQUFDO2FBQU0sSUFBSSxLQUFLLEVBQUUsSUFBSSxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQzVCLFNBQVMsR0FBRyxhQUFhLENBQUM7WUFDMUIsUUFBUSxHQUFHLDBGQUEwRixDQUFDO1FBQzFHLENBQUM7YUFBTSxJQUFJLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztZQUNqRCxTQUFTLEdBQUcsaUJBQWlCLENBQUM7WUFDOUIsUUFBUSxHQUFHLCtFQUErRSxDQUFDO1FBQy9GLENBQUM7UUFFRCxpREFBaUQ7UUFDakQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0MsTUFBTSxrQkFBa0IsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRCxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQztRQUV0RixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDeEMsTUFBTSxFQUFFLHFCQUFxQjtZQUM3QixPQUFPLEVBQUUsK0NBQStDO1lBQ3hELFNBQVM7WUFDVCxRQUFRO1lBQ1IsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLElBQUksZUFBZTtZQUN4QyxXQUFXLEVBQUU7Z0JBQ1QsWUFBWTtnQkFDWixrQkFBa0I7Z0JBQ2xCLHVCQUF1QixFQUFFLElBQUk7Z0JBQzdCLGFBQWEsRUFBRTtvQkFDWCxPQUFPLEVBQUUsTUFBTSxDQUFDLFdBQVc7b0JBQzNCLFNBQVMsRUFBRSxNQUFNLENBQUMsYUFBYTtpQkFDbEM7YUFDSjtZQUNELFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtTQUN0QyxDQUFDLENBQUM7SUFDUCxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxyXG4gKi9cclxuXHJcbmltcG9ydCBleHByZXNzLCB7IFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcyc7XHJcbmltcG9ydCB7IFN0YXR1c0NvZGVzIH0gZnJvbSAnaHR0cC1zdGF0dXMtY29kZXMnO1xyXG5pbXBvcnQgeyBDb250cmFjdCB9IGZyb20gJ0BoeXBlcmxlZGdlci9mYWJyaWMtZ2F0ZXdheSc7XHJcbmltcG9ydCB7IGV2YWx1YXRlVHJhbnNhY3Rpb24gfSBmcm9tICcuLi9mYWJyaWMnO1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCAqIGFzIGNvbmZpZyBmcm9tICcuLi9jb25maWcnO1xyXG5cclxuY29uc3QgeyBPSywgU0VSVklDRV9VTkFWQUlMQUJMRSB9ID0gU3RhdHVzQ29kZXM7XHJcblxyXG5leHBvcnQgY29uc3QgaGVhbHRoUm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcclxuXHJcbi8qKlxyXG4gKiBIZWFsdGggY2hlY2sgZW5kcG9pbnQgdGhhdCB2ZXJpZmllcyBjb25uZWN0aW9uIHRvIHRoZSBibG9ja2NoYWluIG5ldHdvcmtcclxuICovXHJcbmhlYWx0aFJvdXRlci5nZXQoJy8nLCBhc3luYyAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnSGVhbHRoIGNoZWNrIHJlcXVlc3QgcmVjZWl2ZWQnKTtcclxuICAgIFxyXG4gICAgY29uc3QgY29udHJhY3QgPSByZXEuYXBwLmxvY2Fscy5jb250cmFjdCBhcyBDb250cmFjdDtcclxuICAgIFxyXG4gICAgaWYgKCFjb250cmFjdCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0hlYWx0aCBjaGVjayBmYWlsZWQ6IE5vIGNvbnRyYWN0IGluIGFwcCBsb2NhbHMnKTtcclxuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyhTRVJWSUNFX1VOQVZBSUxBQkxFKS5qc29uKHtcclxuICAgICAgICAgICAgc3RhdHVzOiAnU2VydmljZSBVbmF2YWlsYWJsZScsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdOb3QgY29ubmVjdGVkIHRvIGJsb2NrY2hhaW4gbmV0d29yaycsXHJcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRyeSB7XHJcbiAgICAgICAgLy8gVHJ5IHRvIGNhbGwgR2V0QWxsRG9uYXRpb25zIGZ1bmN0aW9uIGFzIGEgc2ltcGxlIHRlc3RcclxuICAgICAgICBjb25zb2xlLmxvZygnRXhlY3V0aW5nIGhlYWx0aCBjaGVjayBxdWVyeS4uLicpO1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV2YWx1YXRlVHJhbnNhY3Rpb24oY29udHJhY3QsICdHZXRBbGxEb25hdGlvbnMnKTtcclxuICAgICAgICBjb25zdCBkb25hdGlvbnMgPSBKU09OLnBhcnNlKEJ1ZmZlci5mcm9tKHJlc3VsdCkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2coYEhlYWx0aCBjaGVjayBzdWNjZXNzZnVsISBGb3VuZCAke2RvbmF0aW9ucy5sZW5ndGh9IGRvbmF0aW9uc2ApO1xyXG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKE9LKS5qc29uKHtcclxuICAgICAgICAgICAgc3RhdHVzOiAnT0snLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnQVBJIGlzIHJ1bm5pbmcgYW5kIGNvbm5lY3RlZCB0byBibG9ja2NoYWluIG5ldHdvcmsnLFxyXG4gICAgICAgICAgICBmYWJyaWM6IHtcclxuICAgICAgICAgICAgICAgIGNvbm5lY3RlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGRvbmF0aW9uczogZG9uYXRpb25zLmxlbmd0aFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0hlYWx0aCBjaGVjayBxdWVyeSBmYWlsZWQ6JywgZXJyb3IpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIENoZWNrIGZvciBjb21tb24gZXJyb3JzIGFuZCBwcm92aWRlIGhlbHBmdWwgZGlhZ25vc3RpY3NcclxuICAgICAgICBsZXQgZXJyb3JUeXBlID0gJ1Vua25vd24gZXJyb3InO1xyXG4gICAgICAgIGxldCBzb2x1dGlvbiA9ICdDaGVjayBuZXR3b3JrIGNvbm5lY3Rpdml0eSBhbmQgYmxvY2tjaGFpbiBzdGF0dXMnO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChlcnJvcj8uY29kZSA9PT0gNCkge1xyXG4gICAgICAgICAgICBlcnJvclR5cGUgPSAnVGltZW91dCc7XHJcbiAgICAgICAgICAgIHNvbHV0aW9uID0gJ1RoZSBuZXR3b3JrIGlzIG5vdCByZXNwb25kaW5nIHdpdGhpbiB0aGUgdGltZW91dCBwZXJpb2QuIEluY3JlYXNlIHRpbWVvdXQgdmFsdWVzIGluIGNvbmZpZy50cy4nO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZXJyb3I/LmNvZGUgPT09IDE0KSB7XHJcbiAgICAgICAgICAgIGVycm9yVHlwZSA9ICdVbmF2YWlsYWJsZSc7XHJcbiAgICAgICAgICAgIHNvbHV0aW9uID0gJ1RoZSBibG9ja2NoYWluIG5ldHdvcmsgaXMgY3VycmVudGx5IHVuYXZhaWxhYmxlLiBDaGVjayBpZiB0aGUgRmFicmljIG5ldHdvcmsgaXMgcnVubmluZy4nO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZXJyb3I/LmRldGFpbHM/LmluY2x1ZGVzPy4oJ2NoYWluY29kZScpKSB7XHJcbiAgICAgICAgICAgIGVycm9yVHlwZSA9ICdDaGFpbmNvZGUgZXJyb3InO1xyXG4gICAgICAgICAgICBzb2x1dGlvbiA9ICdUaGUgY2hhaW5jb2RlIHJldHVybmVkIGFuIGVycm9yLiBDaGVjayBpZiB0aGUgY2hhaW5jb2RlIGlzIHByb3Blcmx5IGRlcGxveWVkLic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIENoZWNrIHdhbGxldCBzdGF0dXMgZm9yIGFkZGl0aW9uYWwgZGlhZ25vc3RpY3NcclxuICAgICAgICBjb25zdCB3YWxsZXRQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIGNvbmZpZy53YWxsZXRQYXRoKTtcclxuICAgICAgICBjb25zdCB3YWxsZXRFeGlzdHMgPSBmcy5leGlzdHNTeW5jKHdhbGxldFBhdGgpO1xyXG4gICAgICAgIGNvbnN0IHVzZXJJZGVudGl0eUV4aXN0cyA9IGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHdhbGxldFBhdGgsIGNvbmZpZy51c2VySWQpKSB8fCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHdhbGxldFBhdGgsIGAke2NvbmZpZy51c2VySWR9LmlkYCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKFNFUlZJQ0VfVU5BVkFJTEFCTEUpLmpzb24oe1xyXG4gICAgICAgICAgICBzdGF0dXM6ICdTZXJ2aWNlIFVuYXZhaWxhYmxlJyxcclxuICAgICAgICAgICAgbWVzc2FnZTogJ0Nvbm5lY3RlZCB0byBuZXR3b3JrIGJ1dCBjb250cmFjdCBjYWxsIGZhaWxlZCcsXHJcbiAgICAgICAgICAgIGVycm9yVHlwZSxcclxuICAgICAgICAgICAgc29sdXRpb24sXHJcbiAgICAgICAgICAgIGVycm9yOiBlcnJvcj8ubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcicsXHJcbiAgICAgICAgICAgIGRpYWdub3N0aWNzOiB7XHJcbiAgICAgICAgICAgICAgICB3YWxsZXRFeGlzdHMsXHJcbiAgICAgICAgICAgICAgICB1c2VySWRlbnRpdHlFeGlzdHMsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uUHJvZmlsZUV4aXN0czogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIG5ldHdvcmtDb25maWc6IHtcclxuICAgICAgICAgICAgICAgICAgICBjaGFubmVsOiBjb25maWcuY2hhbm5lbE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhaW5jb2RlOiBjb25maWcuY2hhaW5jb2RlTmFtZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTsgIl19