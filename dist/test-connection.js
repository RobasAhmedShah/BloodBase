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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config = __importStar(require("./config"));
const fabric_1 = require("./fabric");
/**
 * Simple test to verify wallet setup, connection profile, and network connectivity
 */
async function main() {
    try {
        console.log('=== BloodBase API Connection Test ===');
        // Check connection profile
        const ccpPath = path.resolve(process.cwd(), config.connectionProfilePath);
        console.log(`Connection profile path: ${ccpPath}`);
        if (!fs.existsSync(ccpPath)) {
            console.error(`Error: Connection profile not found at ${ccpPath}`);
            process.exit(1);
        }
        console.log('Connection profile exists - OK');
        // Check wallet and identities
        const walletPath = path.join(process.cwd(), config.walletPath);
        console.log(`Wallet path: ${walletPath}`);
        if (!fs.existsSync(walletPath)) {
            console.log(`Note: Wallet directory does not exist yet at ${walletPath}`);
            console.log('It will be created when you run enrollAdmin.ts');
            process.exit(1);
        }
        // Check for identity files
        const userPath = path.join(walletPath, config.userId);
        const certPath = path.join(userPath, 'cert.pem');
        const keyPath = path.join(userPath, 'key.pem');
        if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
            console.log(`User identity '${config.userId}' exists - OK`);
        }
        else {
            console.log(`User identity '${config.userId}' incomplete or not found - you should run enrollAdmin.ts and registerUser.ts`);
            process.exit(1);
        }
        console.log('\nEnvironment Configuration:');
        console.log(`- Channel Name: ${config.channelName}`);
        console.log(`- Chaincode Name: ${config.chaincodeName}`);
        console.log(`- MSP ID: ${config.mspId}`);
        console.log(`- User ID: ${config.userId}`);
        console.log(`- API Port: ${config.port}`);
        // Test actual connection to the network
        console.log('\nAttempting connection to Fabric network...');
        try {
            // Initialize fabric connection
            const contract = await (0, fabric_1.initFabric)();
            console.log('Successfully connected to Fabric network - OK');
            // Try a simple query to verify chaincode access
            console.log('\nTesting chaincode access...');
            try {
                // This assumes a GetAllDonations function exists in the chaincode
                const result = await (0, fabric_1.evaluateTransaction)(contract, 'GetAllDonations');
                console.log('Successfully queried chaincode - OK');
                // Display first few characters of the result to verify data
                const resultString = Buffer.from(result).toString();
                console.log(`Query result preview: ${resultString.substring(0, 100)}${resultString.length > 100 ? '...' : ''}`);
            }
            catch (ccError) {
                console.error('Failed to query chaincode:', ccError?.message || 'Unknown error');
                console.log('This might be normal if the GetAllDonations function is not implemented in your chaincode');
            }
        }
        catch (connError) {
            console.error('Failed to connect to Fabric network:', connError?.message || 'Unknown error');
            console.error('Please check your connection profile, network status, and identity credentials');
            process.exit(1);
        }
        console.log('\n=== Test Complete ===');
    }
    catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC1jb25uZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Rlc3QtY29ubmVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUgsdUNBQXlCO0FBQ3pCLDJDQUE2QjtBQUM3QixpREFBbUM7QUFDbkMscUNBQTJEO0FBRTNEOztHQUVHO0FBQ0gsS0FBSyxVQUFVLElBQUk7SUFDZixJQUFJLENBQUM7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7UUFFckQsMkJBQTJCO1FBQzNCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFbkQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUMxQixPQUFPLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ25FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsQ0FBQztRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUU5Qyw4QkFBOEI7UUFDOUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9ELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFFMUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUM3QixPQUFPLENBQUMsR0FB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Q0FBQztZQUN0QixPQUFPLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxFQUFFLFNBQVMsRUFBRSxPQUFPLElBQUksZUFBZSxDQUFDLENBQUM7WUFDN0YsT0FBTyxDQUFDLEtBQUssQ0FBQyxnRkFBZ0YsQ0FBQyxDQUFDO1lBQ2hHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsQ0FBQztRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUUzQyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEIsQ0FBQztBQUNMLENBQUM7QUFFRCxJQUFJLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXHJcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXHJcbiAqL1xyXG5cclxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgKiBhcyBjb25maWcgZnJvbSAnLi9jb25maWcnO1xyXG5pbXBvcnQgeyBpbml0RmFicmljLCBldmFsdWF0ZVRyYW5zYWN0aW9uIH0gZnJvbSAnLi9mYWJyaWMnO1xyXG5cclxuLyoqXHJcbiAqIFNpbXBsZSB0ZXN0IHRvIHZlcmlmeSB3YWxsZXQgc2V0dXAsIGNvbm5lY3Rpb24gcHJvZmlsZSwgYW5kIG5ldHdvcmsgY29ubmVjdGl2aXR5XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBtYWluKCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnPT09IEJsb29kQmFzZSBBUEkgQ29ubmVjdGlvbiBUZXN0ID09PScpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIENoZWNrIGNvbm5lY3Rpb24gcHJvZmlsZVxyXG4gICAgICAgIGNvbnN0IGNjcFBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgY29uZmlnLmNvbm5lY3Rpb25Qcm9maWxlUGF0aCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYENvbm5lY3Rpb24gcHJvZmlsZSBwYXRoOiAke2NjcFBhdGh9YCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGNjcFBhdGgpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOiBDb25uZWN0aW9uIHByb2ZpbGUgbm90IGZvdW5kIGF0ICR7Y2NwUGF0aH1gKTtcclxuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGlvbiBwcm9maWxlIGV4aXN0cyAtIE9LJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQ2hlY2sgd2FsbGV0IGFuZCBpZGVudGl0aWVzXHJcbiAgICAgICAgY29uc3Qgd2FsbGV0UGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBjb25maWcud2FsbGV0UGF0aCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFdhbGxldCBwYXRoOiAke3dhbGxldFBhdGh9YCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHdhbGxldFBhdGgpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBOb3RlOiBXYWxsZXQgZGlyZWN0b3J5IGRvZXMgbm90IGV4aXN0IHlldCBhdCAke3dhbGxldFBhdGh9YCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJdCB3aWxsIGJlIGNyZWF0ZWQgd2hlbiB5b3UgcnVuIGVucm9sbEFkbWluLnRzJyk7XHJcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGlkZW50aXR5IGZpbGVzXHJcbiAgICAgICAgY29uc3QgdXNlclBhdGggPSBwYXRoLmpvaW4od2FsbGV0UGF0aCwgY29uZmlnLnVzZXJJZCk7XHJcbiAgICAgICAgY29uc3QgY2VydFBhdGggPSBwYXRoLmpvaW4odXNlclBhdGgsICdjZXJ0LnBlbScpO1xyXG4gICAgICAgIGNvbnN0IGtleVBhdGggPSBwYXRoLmpvaW4odXNlclBhdGgsICdrZXkucGVtJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoY2VydFBhdGgpICYmIGZzLmV4aXN0c1N5bmMoa2V5UGF0aCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFVzZXIgaWRlbnRpdHkgJyR7Y29uZmlnLnVzZXJJZH0nIGV4aXN0cyAtIE9LYCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFVzZXIgaWRlbnRpdHkgJyR7Y29uZmlnLnVzZXJJZH0nIGluY29tcGxldGUgb3Igbm90IGZvdW5kIC0geW91IHNob3VsZCBydW4gZW5yb2xsQWRtaW4udHMgYW5kIHJlZ2lzdGVyVXNlci50c2ApO1xyXG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG5FbnZpcm9ubWVudCBDb25maWd1cmF0aW9uOicpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGAtIENoYW5uZWwgTmFtZTogJHtjb25maWcuY2hhbm5lbE5hbWV9YCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYC0gQ2hhaW5jb2RlIE5hbWU6ICR7Y29uZmlnLmNoYWluY29kZU5hbWV9YCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYC0gTVNQIElEOiAke2NvbmZpZy5tc3BJZH1gKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgLSBVc2VyIElEOiAke2NvbmZpZy51c2VySWR9YCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYC0gQVBJIFBvcnQ6ICR7Y29uZmlnLnBvcnR9YCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVGVzdCBhY3R1YWwgY29ubmVjdGlvbiB0byB0aGUgbmV0d29ya1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG5BdHRlbXB0aW5nIGNvbm5lY3Rpb24gdG8gRmFicmljIG5ldHdvcmsuLi4nKTtcclxuICAgICAgICBcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyBJbml0aWFsaXplIGZhYnJpYyBjb25uZWN0aW9uXHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnRyYWN0ID0gYXdhaXQgaW5pdEZhYnJpYygpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU3VjY2Vzc2Z1bGx5IGNvbm5lY3RlZCB0byBGYWJyaWMgbmV0d29yayAtIE9LJyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBUcnkgYSBzaW1wbGUgcXVlcnkgdG8gdmVyaWZ5IGNoYWluY29kZSBhY2Nlc3NcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1xcblRlc3RpbmcgY2hhaW5jb2RlIGFjY2Vzcy4uLicpO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBhc3N1bWVzIGEgR2V0QWxsRG9uYXRpb25zIGZ1bmN0aW9uIGV4aXN0cyBpbiB0aGUgY2hhaW5jb2RlXHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBldmFsdWF0ZVRyYW5zYWN0aW9uKGNvbnRyYWN0LCAnR2V0QWxsRG9uYXRpb25zJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU3VjY2Vzc2Z1bGx5IHF1ZXJpZWQgY2hhaW5jb2RlIC0gT0snKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy8gRGlzcGxheSBmaXJzdCBmZXcgY2hhcmFjdGVycyBvZiB0aGUgcmVzdWx0IHRvIHZlcmlmeSBkYXRhXHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHRTdHJpbmcgPSBCdWZmZXIuZnJvbShyZXN1bHQpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUXVlcnkgcmVzdWx0IHByZXZpZXc6ICR7cmVzdWx0U3RyaW5nLnN1YnN0cmluZygwLCAxMDApfSR7cmVzdWx0U3RyaW5nLmxlbmd0aCA+IDEwMCA/ICcuLi4nIDogJyd9YCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGNjRXJyb3I6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHF1ZXJ5IGNoYWluY29kZTonLCBjY0Vycm9yPy5tZXNzYWdlIHx8ICdVbmtub3duIGVycm9yJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVGhpcyBtaWdodCBiZSBub3JtYWwgaWYgdGhlIEdldEFsbERvbmF0aW9ucyBmdW5jdGlvbiBpcyBub3QgaW1wbGVtZW50ZWQgaW4geW91ciBjaGFpbmNvZGUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGNvbm5FcnJvcjogYW55KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjb25uZWN0IHRvIEZhYnJpYyBuZXR3b3JrOicsIGNvbm5FcnJvcj8ubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcicpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdQbGVhc2UgY2hlY2sgeW91ciBjb25uZWN0aW9uIHByb2ZpbGUsIG5ldHdvcmsgc3RhdHVzLCBhbmQgaWRlbnRpdHkgY3JlZGVudGlhbHMnKTtcclxuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZygnXFxuPT09IFRlc3QgQ29tcGxldGUgPT09Jyk7XHJcbiAgICAgICAgXHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Rlc3QgZmFpbGVkOicsIGVycm9yKTtcclxuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1haW4oKTsgIl19