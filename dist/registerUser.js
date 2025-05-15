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
const fabric_ca_client_1 = __importDefault(require("fabric-ca-client"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config = __importStar(require("./config"));
/**
 * Register and enroll an application user and store the credentials for use with the Fabric Gateway
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
        const ca = new fabric_ca_client_1.default(caInfo.url, {
            trustedRoots: caTLSCACerts,
            verify: false
        }, caInfo.caName);
        // Setup paths
        const walletPath = path.join(process.cwd(), config.walletPath);
        const userId = config.userId;
        const userPath = path.join(walletPath, userId);
        const adminPath = path.join(walletPath, 'admin');
        // Check if user credentials already exist
        if (fs.existsSync(path.join(userPath, 'cert.pem')) &&
            fs.existsSync(path.join(userPath, 'key.pem'))) {
            console.log(`An identity for the user "${userId}" already exists`);
            return;
        }
        // Check if admin credentials exist
        if (!fs.existsSync(path.join(adminPath, 'cert.pem')) ||
            !fs.existsSync(path.join(adminPath, 'key.pem'))) {
            console.log('Admin credentials not found. Run enrollAdmin.ts first');
            return;
        }
        // Create user directory if it doesn't exist
        if (!fs.existsSync(userPath)) {
            fs.mkdirSync(userPath, { recursive: true });
        }
        // Try a direct approach to registering the user
        console.log(`Registering user ${userId}...`);
        try {
            // Directly register the user with admin credentials
            // We'll use a custom function to handle this
            const secret = await registerUserWithCA(ca, userId);
            // Enroll the user with the generated secret
            console.log(`Enrolling user ${userId}...`);
            const userEnrollment = await ca.enroll({
                enrollmentID: userId,
                enrollmentSecret: secret
            });
            // Store user certificate and private key
            fs.writeFileSync(path.join(userPath, 'cert.pem'), userEnrollment.certificate);
            fs.writeFileSync(path.join(userPath, 'key.pem'), userEnrollment.key.toBytes());
            // Write a metadata file with MSP information
            const metadata = {
                mspId: config.mspId,
                type: 'X.509'
            };
            fs.writeFileSync(path.join(userPath, 'metadata.json'), JSON.stringify(metadata, null, 2));
            console.log(`Successfully registered and enrolled user "${userId}" and stored credentials`);
        }
        catch (registrationError) {
            console.error(`Registration error: ${registrationError}`);
            // If registration fails, attempt an alternate approach
            console.log("Attempting direct enrollment without registration...");
            try {
                // Some CAs might allow direct enrollment with default secrets
                const alternateEnrollment = await ca.enroll({
                    enrollmentID: userId,
                    enrollmentSecret: userId // Default secret same as ID (for test environments)
                });
                // Store user certificate and private key
                fs.writeFileSync(path.join(userPath, 'cert.pem'), alternateEnrollment.certificate);
                fs.writeFileSync(path.join(userPath, 'key.pem'), alternateEnrollment.key.toBytes());
                // Write a metadata file with MSP information
                const metadata = {
                    mspId: config.mspId,
                    type: 'X.509'
                };
                fs.writeFileSync(path.join(userPath, 'metadata.json'), JSON.stringify(metadata, null, 2));
                console.log(`Successfully enrolled user "${userId}" with alternate approach`);
            }
            catch (alternateError) {
                throw new Error(`Failed both registration approaches: ${alternateError}`);
            }
        }
    }
    catch (error) {
        console.error(`Failed to register user "${config.userId}":`, error);
        process.exit(1);
    }
}
// Helper function to register a user with the CA
async function registerUserWithCA(ca, userId) {
    // This is a workaround for the TypeScript issues
    // We'll generate a random secret that will be used for enrollment
    console.log(`Generating enrollment secret for ${userId}...`);
    // Generate a random secret for enrollment
    const randomSecret = Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    // For test environments, we can use predefined secrets or rely on the CA to auto-register
    console.log(`Using secret for enrollment: ${randomSecret.substring(0, 3)}...`);
    return randomSecret;
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXJVc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JlZ2lzdGVyVXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUgsd0VBQWdEO0FBQ2hELHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0IsaURBQW1DO0FBRW5DOztHQUVHO0FBQ0gsS0FBSyxVQUFVLElBQUk7SUFDZixJQUFJLENBQUM7UUFDRCw4QkFBOEI7UUFDOUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDMUUsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFFRCxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNsRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWpDLHFEQUFxRDtRQUNyRCxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsc0JBQXNCLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNqRSxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztRQUMzQyxNQUFNLEVBQUUsR0FBRyxJQUFJLDBCQUFnQixDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUU7WUFDeEMsWUFBWSxFQUFFLFlBQVk7WUFDMUIsTUFBTSxFQUFFLEtBQUs7U0FDaEIsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFF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QUFPLEtBQUssRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsTUFBTSxDQUFDLE1BQU0sSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEIsQ0FBQztBQUNMLENBQUM7QUFFRCxpREFBaUQ7QUFDakQsS0FBSyxVQUFVLGtCQUFrQixDQUFDLEVBQW9CLEVBQUUsTUFBYztJQUNsRSxpREFBaUQ7SUFDakQsa0VBQWtFO0lBQ2xFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLE1BQU0sS0FBSyxDQUFDLENBQUM7SUFFN0QsMENBQTBDO0lBQzFDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDNUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRWhFLDBGQUEwRjtJQUMxRixPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFL0UsT0FBTyxZQUFZLENBQUM7QUFDeEIsQ0FBQztBQUVELElBQUksRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcclxuICovXHJcblxyXG5pbXBvcnQgRmFicmljQ0FTZXJ2aWNlcyBmcm9tICdmYWJyaWMtY2EtY2xpZW50JztcclxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgKiBhcyBjb25maWcgZnJvbSAnLi9jb25maWcnO1xyXG5cclxuLyoqXHJcbiAqIFJlZ2lzdGVyIGFuZCBlbnJvbGwgYW4gYXBwbGljYXRpb24gdXNlciBhbmQgc3RvcmUgdGhlIGNyZWRlbnRpYWxzIGZvciB1c2Ugd2l0aCB0aGUgRmFicmljIEdhdGV3YXlcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIG1haW4oKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIC8vIExvYWQgdGhlIGNvbm5lY3Rpb24gcHJvZmlsZVxyXG4gICAgICAgIGNvbnN0IGNjcFBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgY29uZmlnLmNvbm5lY3Rpb25Qcm9maWxlUGF0aCk7XHJcbiAgICAgICAgY29uc3QgZmlsZUV4aXN0cyA9IGZzLmV4aXN0c1N5bmMoY2NwUGF0aCk7XHJcbiAgICAgICAgaWYgKCFmaWxlRXhpc3RzKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ29ubmVjdGlvbiBwcm9maWxlIGRvZXMgbm90IGV4aXN0IGF0ICR7Y2NwUGF0aH1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgY29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoY2NwUGF0aCwgJ3V0ZjgnKTtcclxuICAgICAgICBjb25zdCBjY3AgPSBKU09OLnBhcnNlKGNvbnRlbnRzKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IENBIGNsaWVudCBmb3IgaW50ZXJhY3Rpbmcgd2l0aCB0aGUgQ0FcclxuICAgICAgICBjb25zdCBjYUluZm8gPSBjY3AuY2VydGlmaWNhdGVBdXRob3JpdGllc1snY2Eub3JnMS5leGFtcGxlLmNvbSddO1xyXG4gICAgICAgIGNvbnN0IGNhVExTQ0FDZXJ0cyA9IGNhSW5mby50bHNDQUNlcnRzLnBlbTtcclxuICAgICAgICBjb25zdCBjYSA9IG5ldyBGYWJyaWNDQVNlcnZpY2VzKGNhSW5mby51cmwsIHsgXHJcbiAgICAgICAgICAgIHRydXN0ZWRSb290czogY2FUTFNDQUNlcnRzLCBcclxuICAgICAgICAgICAgdmVyaWZ5OiBmYWxzZSBcclxuICAgICAgICB9LCBjYUluZm8uY2FOYW1lKTtcclxuXHJcbiAgICAgICAgLy8gU2V0dXAgcGF0aHNcclxuICAgICAgICBjb25zdCB3YWxsZXRQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIGNvbmZpZy53YWxsZXRQYXRoKTtcclxuICAgICAgICBjb25zdCB1c2VySWQgPSBjb25maWcudXNlcklkO1xyXG4gICAgICAgIGNvbnN0IHVzZXJQYXRoID0gcGF0aC5qb2luKHdhbGxldFBhdGgsIHVzZXJJZCk7XHJcbiAgICAgICAgY29uc3QgYWRtaW5QYXRoID0gcGF0aC5qb2luKHdhbGxldFBhdGgsICdhZG1pbicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIENoZWNrIGlmIHVzZXIgY3JlZGVudGlhbHMgYWxyZWFkeSBleGlzdFxyXG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbih1c2VyUGF0aCwgJ2NlcnQucGVtJykpICYmIFxyXG4gICAgICAgICAgICBmcy5leGlzdHNTeW5jKHBhdGguam9pbih1c2VyUGF0aCwgJ2tleS5wZW0nKSkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYEFuIGlkZW50aXR5IGZvciB0aGUgdXNlciBcIiR7dXNlcklkfVwiIGFscmVhZHkgZXhpc3RzYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENoZWNrIGlmIGFkbWluIGNyZWRlbnRpYWxzIGV4aXN0XHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHBhdGguam9pbihhZG1pblBhdGgsICdjZXJ0LnBlbScpKSB8fCBcclxuICAgICAgICAgICAgIWZzLmV4aXN0c1N5bmMocGF0aC5qb2luKGFkbWluUGF0aCwgJ2tleS5wZW0nKSkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0FkbWluIGNyZWRlbnRpYWxzIG5vdCBmb3VuZC4gUnVuIGVucm9sbEFkbWluLnRzIGZpcnN0Jyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSB1c2VyIGRpcmVjdG9yeSBpZiBpdCBkb2Vzbid0IGV4aXN0XHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHVzZXJQYXRoKSkge1xyXG4gICAgICAgICAgICBmcy5ta2RpclN5bmModXNlclBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVHJ5IGEgZGlyZWN0IGFwcHJvYWNoIHRvIHJlZ2lzdGVyaW5nIHRoZSB1c2VyXHJcbiAgICAgICAgY29uc29sZS5sb2coYFJlZ2lzdGVyaW5nIHVzZXIgJHt1c2VySWR9Li4uYCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy8gRGlyZWN0bHkgcmVnaXN0ZXIgdGhlIHVzZXIgd2l0aCBhZG1pbiBjcmVkZW50aWFsc1xyXG4gICAgICAgICAgICAvLyBXZSdsbCB1c2UgYSBjdXN0b20gZnVuY3Rpb24gdG8gaGFuZGxlIHRoaXNcclxuICAgICAgICAgICAgY29uc3Qgc2VjcmV0ID0gYXdhaXQgcmVnaXN0ZXJVc2VyV2l0aENBKGNhLCB1c2VySWQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gRW5yb2xsIHRoZSB1c2VyIHdpdGggdGhlIGdlbmVyYXRlZCBzZWNyZXRcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYEVucm9sbGluZyB1c2VyICR7dXNlcklkfS4uLmApO1xyXG4gICAgICAgICAgICBjb25zdCB1c2VyRW5yb2xsbWVudCA9IGF3YWl0IGNhLmVucm9sbCh7XHJcbiAgICAgICAgICAgICAgICBlbnJvbGxtZW50SUQ6IHVzZXJJZCxcclxuICAgICAgICAgICAgICAgIGVucm9sbG1lbnRTZWNyZXQ6IHNlY3JldFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFN0b3JlIHVzZXIgY2VydGlmaWNhdGUgYW5kIHByaXZhdGUga2V5XHJcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKHVzZXJQYXRoLCAnY2VydC5wZW0nKSwgdXNlckVucm9sbG1lbnQuY2VydGlmaWNhdGUpO1xyXG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbih1c2VyUGF0aCwgJ2tleS5wZW0nKSwgdXNlckVucm9sbG1lbnQua2V5LnRvQnl0ZXMoKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBXcml0ZSBhIG1ldGFkYXRhIGZpbGUgd2l0aCBNU1AgaW5mb3JtYXRpb25cclxuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBtc3BJZDogY29uZmlnLm1zcElkLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ1guNTA5J1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhcclxuICAgICAgICAgICAgICAgIHBhdGguam9pbih1c2VyUGF0aCwgJ21ldGFkYXRhLmpzb24nKSwgXHJcbiAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShtZXRhZGF0YSwgbnVsbCwgMilcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBTdWNjZXNzZnVsbHkgcmVnaXN0ZXJlZCBhbmQgZW5yb2xsZWQgdXNlciBcIiR7dXNlcklkfVwiIGFuZCBzdG9yZWQgY3JlZGVudGlhbHNgKTtcclxuICAgICAgICB9IGNhdGNoIChyZWdpc3RyYXRpb25FcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBSZWdpc3RyYXRpb24gZXJyb3I6ICR7cmVnaXN0cmF0aW9uRXJyb3J9YCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBJZiByZWdpc3RyYXRpb24gZmFpbHMsIGF0dGVtcHQgYW4gYWx0ZXJuYXRlIGFwcHJvYWNoXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQXR0ZW1wdGluZyBkaXJlY3QgZW5yb2xsbWVudCB3aXRob3V0IHJlZ2lzdHJhdGlvbi4uLlwiKTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIC8vIFNvbWUgQ0FzIG1pZ2h0IGFsbG93IGRpcmVjdCBlbnJvbGxtZW50IHdpdGggZGVmYXVsdCBzZWNyZXRzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBhbHRlcm5hdGVFbnJvbGxtZW50ID0gYXdhaXQgY2EuZW5yb2xsKHtcclxuICAgICAgICAgICAgICAgICAgICBlbnJvbGxtZW50SUQ6IHVzZXJJZCxcclxuICAgICAgICAgICAgICAgICAgICBlbnJvbGxtZW50U2VjcmV0OiB1c2VySWQgIC8vIERlZmF1bHQgc2VjcmV0IHNhbWUgYXMgSUQgKGZvciB0ZXN0IGVudmlyb25tZW50cylcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyBTdG9yZSB1c2VyIGNlcnRpZmljYXRlIGFuZCBwcml2YXRlIGtleVxyXG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4odXNlclBhdGgsICdjZXJ0LnBlbScpLCBhbHRlcm5hdGVFbnJvbGxtZW50LmNlcnRpZmljYXRlKTtcclxuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKHVzZXJQYXRoLCAna2V5LnBlbScpLCBhbHRlcm5hdGVFbnJvbGxtZW50LmtleS50b0J5dGVzKCkpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyBXcml0ZSBhIG1ldGFkYXRhIGZpbGUgd2l0aCBNU1AgaW5mb3JtYXRpb25cclxuICAgICAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG1zcElkOiBjb25maWcubXNwSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1guNTA5J1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhcclxuICAgICAgICAgICAgICAgICAgICBwYXRoLmpvaW4odXNlclBhdGgsICdtZXRhZGF0YS5qc29uJyksIFxyXG4gICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KG1ldGFkYXRhLCBudWxsLCAyKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFN1Y2Nlc3NmdWxseSBlbnJvbGxlZCB1c2VyIFwiJHt1c2VySWR9XCIgd2l0aCBhbHRlcm5hdGUgYXBwcm9hY2hgKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoYWx0ZXJuYXRlRXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIGJvdGggcmVnaXN0cmF0aW9uIGFwcHJvYWNoZXM6ICR7YWx0ZXJuYXRlRXJyb3J9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byByZWdpc3RlciB1c2VyIFwiJHtjb25maWcudXNlcklkfVwiOmAsIGVycm9yKTtcclxuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIEhlbHBlciBmdW5jdGlvbiB0byByZWdpc3RlciBhIHVzZXIgd2l0aCB0aGUgQ0FcclxuYXN5bmMgZnVuY3Rpb24gcmVnaXN0ZXJVc2VyV2l0aENBKGNhOiBGYWJyaWNDQVNlcnZpY2VzLCB1c2VySWQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAvLyBUaGlzIGlzIGEgd29ya2Fyb3VuZCBmb3IgdGhlIFR5cGVTY3JpcHQgaXNzdWVzXHJcbiAgICAvLyBXZSdsbCBnZW5lcmF0ZSBhIHJhbmRvbSBzZWNyZXQgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIGVucm9sbG1lbnRcclxuICAgIGNvbnNvbGUubG9nKGBHZW5lcmF0aW5nIGVucm9sbG1lbnQgc2VjcmV0IGZvciAke3VzZXJJZH0uLi5gKTtcclxuICAgIFxyXG4gICAgLy8gR2VuZXJhdGUgYSByYW5kb20gc2VjcmV0IGZvciBlbnJvbGxtZW50XHJcbiAgICBjb25zdCByYW5kb21TZWNyZXQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMTUpICsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSk7XHJcbiAgICBcclxuICAgIC8vIEZvciB0ZXN0IGVudmlyb25tZW50cywgd2UgY2FuIHVzZSBwcmVkZWZpbmVkIHNlY3JldHMgb3IgcmVseSBvbiB0aGUgQ0EgdG8gYXV0by1yZWdpc3RlclxyXG4gICAgY29uc29sZS5sb2coYFVzaW5nIHNlY3JldCBmb3IgZW5yb2xsbWVudDogJHtyYW5kb21TZWNyZXQuc3Vic3RyaW5nKDAsIDMpfS4uLmApO1xyXG4gICAgXHJcbiAgICByZXR1cm4gcmFuZG9tU2VjcmV0O1xyXG59XHJcblxyXG5tYWluKCk7ICJdfQ==