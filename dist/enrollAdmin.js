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
 * Enroll the admin user and store the certificate and private key for use with the Fabric Gateway
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
        // Create directories for storing identity credentials
        const walletPath = path.join(process.cwd(), config.walletPath);
        const adminPath = path.join(walletPath, 'admin');
        // Check if admin directory already exists
        if (fs.existsSync(path.join(adminPath, 'cert.pem')) &&
            fs.existsSync(path.join(adminPath, 'key.pem'))) {
            console.log('An identity for the admin user "admin" already exists');
            return;
        }
        // Create directories if they don't exist
        if (!fs.existsSync(walletPath)) {
            fs.mkdirSync(walletPath, { recursive: true });
        }
        if (!fs.existsSync(adminPath)) {
            fs.mkdirSync(adminPath, { recursive: true });
        }
        // Enroll the admin user
        console.log('Enrolling admin user...');
        const enrollment = await ca.enroll({
            enrollmentID: 'admin',
            enrollmentSecret: 'adminpw'
        });
        // Write certificate and private key to files
        fs.writeFileSync(path.join(adminPath, 'cert.pem'), enrollment.certificate);
        fs.writeFileSync(path.join(adminPath, 'key.pem'), enrollment.key.toBytes());
        // Write a metadata file with MSP information
        const metadata = {
            mspId: config.mspId,
            type: 'X.509'
        };
        fs.writeFileSync(path.join(adminPath, 'metadata.json'), JSON.stringify(metadata, null, 2));
        console.log('Successfully enrolled admin user "admin" and stored credentials');
    }
    catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5yb2xsQWRtaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZW5yb2xsQWRtaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILHdFQUFnRDtBQUNoRCx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLGlEQUFtQztBQUVuQzs7R0FFRztBQUNILEtBQUssVUFBVSxJQUFJO0lBQ2YsSUFBSSxDQUFDO1FBQ0QsOEJBQThCO1FBQzlCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzFFLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBRUQsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVqQyxxREFBcUQ7UUFDckQsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLHNCQUFzQixDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDakUsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUM7UUFDM0MsTUFBTSxFQUFFLEdBQUcsSUFBSSwwQkFBZ0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFO1lBQ3hDLFlBQVksRUFBRSxZQUFZO1lBQzFCLE1BQU0sRUFBRSxLQUFLO1NBQ2hCLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWxCLHNEQUFzRDtRQUN0RCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFakQsMENBQTBDO1FBQzFDLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMvQyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLHVEQUF1RCxDQUFDLENBQUM7WUFDckUsT0FBTztRQUNYLENBQUM7UUFFRCx5Q0FBeUM7UUFDekMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUM3QixFQUFFLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFFRCxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQzVCLEVBQUUsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUVELHdCQUF3QjtRQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDdkMsTUFBTSxVQUFVLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQy9CLFlBQVksRUFBRSxPQUFPO1lBQ3JCLGdCQUFnQixFQUFFLFNBQVM7U0FDOUIsQ0FBQyxDQUFDO1FBRUgsNkNBQTZDO1FBQzdDLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLEVBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzNFLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRTVFLDZDQUE2QztRQUM3QyxNQUFNLFFBQVEsR0FBRztZQUNiLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSztZQUNuQixJQUFJLEVBQUUsT0FBTztTQUNoQixDQUFDO1FBRUYsRUFBRSxDQUFDLGFBQWEsQ0FDWixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsRUFDckMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUNwQyxDQUFDO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpRUFBaUUsQ0FBQyxDQUFDO0lBRW5GLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUMvRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7QUFDTCxDQUFDO0FBRUQsSUFBSSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxyXG4gKi9cclxuXHJcbmltcG9ydCBGYWJyaWNDQVNlcnZpY2VzIGZyb20gJ2ZhYnJpYy1jYS1jbGllbnQnO1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCAqIGFzIGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XHJcblxyXG4vKipcclxuICogRW5yb2xsIHRoZSBhZG1pbiB1c2VyIGFuZCBzdG9yZSB0aGUgY2VydGlmaWNhdGUgYW5kIHByaXZhdGUga2V5IGZvciB1c2Ugd2l0aCB0aGUgRmFicmljIEdhdGV3YXlcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIG1haW4oKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIC8vIExvYWQgdGhlIGNvbm5lY3Rpb24gcHJvZmlsZVxyXG4gICAgICAgIGNvbnN0IGNjcFBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgY29uZmlnLmNvbm5lY3Rpb25Qcm9maWxlUGF0aCk7XHJcbiAgICAgICAgY29uc3QgZmlsZUV4aXN0cyA9IGZzLmV4aXN0c1N5bmMoY2NwUGF0aCk7XHJcbiAgICAgICAgaWYgKCFmaWxlRXhpc3RzKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ29ubmVjdGlvbiBwcm9maWxlIGRvZXMgbm90IGV4aXN0IGF0ICR7Y2NwUGF0aH1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgY29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoY2NwUGF0aCwgJ3V0ZjgnKTtcclxuICAgICAgICBjb25zdCBjY3AgPSBKU09OLnBhcnNlKGNvbnRlbnRzKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IENBIGNsaWVudCBmb3IgaW50ZXJhY3Rpbmcgd2l0aCB0aGUgQ0FcclxuICAgICAgICBjb25zdCBjYUluZm8gPSBjY3AuY2VydGlmaWNhdGVBdXRob3JpdGllc1snY2Eub3JnMS5leGFtcGxlLmNvbSddO1xyXG4gICAgICAgIGNvbnN0IGNhVExTQ0FDZXJ0cyA9IGNhSW5mby50bHNDQUNlcnRzLnBlbTtcclxuICAgICAgICBjb25zdCBjYSA9IG5ldyBGYWJyaWNDQVNlcnZpY2VzKGNhSW5mby51cmwsIHsgXHJcbiAgICAgICAgICAgIHRydXN0ZWRSb290czogY2FUTFNDQUNlcnRzLCBcclxuICAgICAgICAgICAgdmVyaWZ5OiBmYWxzZSBcclxuICAgICAgICB9LCBjYUluZm8uY2FOYW1lKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGRpcmVjdG9yaWVzIGZvciBzdG9yaW5nIGlkZW50aXR5IGNyZWRlbnRpYWxzXHJcbiAgICAgICAgY29uc3Qgd2FsbGV0UGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBjb25maWcud2FsbGV0UGF0aCk7XHJcbiAgICAgICAgY29uc3QgYWRtaW5QYXRoID0gcGF0aC5qb2luKHdhbGxldFBhdGgsICdhZG1pbicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIENoZWNrIGlmIGFkbWluIGRpcmVjdG9yeSBhbHJlYWR5IGV4aXN0c1xyXG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbihhZG1pblBhdGgsICdjZXJ0LnBlbScpKSAmJiBcclxuICAgICAgICAgICAgZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4oYWRtaW5QYXRoLCAna2V5LnBlbScpKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQW4gaWRlbnRpdHkgZm9yIHRoZSBhZG1pbiB1c2VyIFwiYWRtaW5cIiBhbHJlYWR5IGV4aXN0cycpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDcmVhdGUgZGlyZWN0b3JpZXMgaWYgdGhleSBkb24ndCBleGlzdFxyXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh3YWxsZXRQYXRoKSkge1xyXG4gICAgICAgICAgICBmcy5ta2RpclN5bmMod2FsbGV0UGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhhZG1pblBhdGgpKSB7XHJcbiAgICAgICAgICAgIGZzLm1rZGlyU3luYyhhZG1pblBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRW5yb2xsIHRoZSBhZG1pbiB1c2VyXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Vucm9sbGluZyBhZG1pbiB1c2VyLi4uJyk7XHJcbiAgICAgICAgY29uc3QgZW5yb2xsbWVudCA9IGF3YWl0IGNhLmVucm9sbCh7IFxyXG4gICAgICAgICAgICBlbnJvbGxtZW50SUQ6ICdhZG1pbicsIFxyXG4gICAgICAgICAgICBlbnJvbGxtZW50U2VjcmV0OiAnYWRtaW5wdycgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gV3JpdGUgY2VydGlmaWNhdGUgYW5kIHByaXZhdGUga2V5IHRvIGZpbGVzXHJcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4oYWRtaW5QYXRoLCAnY2VydC5wZW0nKSwgZW5yb2xsbWVudC5jZXJ0aWZpY2F0ZSk7XHJcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4oYWRtaW5QYXRoLCAna2V5LnBlbScpLCBlbnJvbGxtZW50LmtleS50b0J5dGVzKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFdyaXRlIGEgbWV0YWRhdGEgZmlsZSB3aXRoIE1TUCBpbmZvcm1hdGlvblxyXG4gICAgICAgIGNvbnN0IG1ldGFkYXRhID0ge1xyXG4gICAgICAgICAgICBtc3BJZDogY29uZmlnLm1zcElkLFxyXG4gICAgICAgICAgICB0eXBlOiAnWC41MDknXHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKFxyXG4gICAgICAgICAgICBwYXRoLmpvaW4oYWRtaW5QYXRoLCAnbWV0YWRhdGEuanNvbicpLCBcclxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkobWV0YWRhdGEsIG51bGwsIDIpXHJcbiAgICAgICAgKTtcclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZygnU3VjY2Vzc2Z1bGx5IGVucm9sbGVkIGFkbWluIHVzZXIgXCJhZG1pblwiIGFuZCBzdG9yZWQgY3JlZGVudGlhbHMnKTtcclxuXHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byBlbnJvbGwgYWRtaW4gdXNlciBcImFkbWluXCI6ICR7ZXJyb3J9YCk7XHJcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tYWluKCk7ICJdfQ==