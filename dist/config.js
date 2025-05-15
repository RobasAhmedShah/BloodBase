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
exports.commitTimeout = exports.submitTimeout = exports.endorseTimeout = exports.queryTimeout = exports.baseApiPath = exports.apiVersion = exports.apiPrefix = exports.logLevel = exports.host = exports.port = exports.asLocalhost = exports.connectionProfilePath = exports.walletPath = exports.userId = exports.mspId = exports.chaincodeName = exports.channelName = void 0;
const path = __importStar(require("path"));
// Channel and chaincode configuration
exports.channelName = process.env.CHANNEL_NAME || 'mychannel';
exports.chaincodeName = process.env.CHAINCODE_NAME || 'bloodbase';
// MSP configuration
exports.mspId = process.env.MSP_ID || 'Org1MSP';
// User identity to use for API operations
exports.userId = process.env.FABRIC_USER_ID || 'appUser';
// Wallet configuration
exports.walletPath = process.env.WALLET_PATH || 'wallet';
// Connection profile
exports.connectionProfilePath = process.env.CONNECTION_PROFILE_PATH ||
    path.join('fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
// Network configuration
exports.asLocalhost = process.env.AS_LOCALHOST ? process.env.AS_LOCALHOST === 'true' : true;
// Server configuration
exports.port = process.env.PORT || 3000;
exports.host = process.env.HOST || 'localhost';
// Log level
exports.logLevel = process.env.LOG_LEVEL || 'info';
// API paths
exports.apiPrefix = '/api';
exports.apiVersion = '/v1';
exports.baseApiPath = exports.apiPrefix + exports.apiVersion;
// Timeouts (in seconds)
exports.queryTimeout = Number(process.env.QUERY_TIMEOUT || 120);
exports.endorseTimeout = Number(process.env.ENDORSE_TIMEOUT || 120);
exports.submitTimeout = Number(process.env.SUBMIT_TIMEOUT || 120);
exports.commitTimeout = Number(process.env.COMMIT_TIMEOUT || 600);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILDJDQUE2QjtBQUU3QixzQ0FBc0M7QUFDekIsUUFBQSxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksV0FBVyxDQUFDO0FBQ3RELFFBQUEsYUFBYSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxJQUFJLFdBQVcsQ0FBQztBQUV2RSxvQkFBb0I7QUFDUCxRQUFBLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUM7QUFFckQsMENBQTBDO0FBQzdCLFFBQUEsTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxJQUFJLFNBQVMsQ0FBQztBQUU5RCx1QkFBdUI7QUFDVixRQUFBLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxRQUFRLENBQUM7QUFFOUQscUJBQXFCO0FBQ1IsUUFBQSxxQkFBcUIsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QjtJQUNwRSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsa0JBQWtCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztBQUVsSSx3QkFBd0I7QUFDWCxRQUFBLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFFakcsdUJBQXVCO0FBQ1YsUUFBQSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDO0FBQ2hDLFFBQUEsSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQztBQUVwRCxZQUFZO0FBQ0MsUUFBQSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDO0FBRXhELFlBQVk7QUFDQyxRQUFBLFNBQVMsR0FBRyxNQUFNLENBQUM7QUFDbkIsUUFBQSxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ25CLFFBQUEsV0FBVyxHQUFHLGlCQUFTLEdBQUcsa0JBQVUsQ0FBQztBQUVsRCx3QkFBd0I7QUFDWCxRQUFBLFlBQVksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksR0FBRyxDQUFDLENBQUM7QUFDeEQsUUFBQSxjQUFjLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQzVELFFBQUEsYUFBYSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUMxRCxRQUFBLGFBQWEsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksR0FBRyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxyXG4gKi9cclxuXHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG4vLyBDaGFubmVsIGFuZCBjaGFpbmNvZGUgY29uZmlndXJhdGlvblxyXG5leHBvcnQgY29uc3QgY2hhbm5lbE5hbWUgPSBwcm9jZXNzLmVudi5DSEFOTkVMX05BTUUgfHwgJ215Y2hhbm5lbCc7XHJcbmV4cG9ydCBjb25zdCBjaGFpbmNvZGVOYW1lID0gcHJvY2Vzcy5lbnYuQ0hBSU5DT0RFX05BTUUgfHwgJ2Jsb29kYmFzZSc7XHJcblxyXG4vLyBNU1AgY29uZmlndXJhdGlvblxyXG5leHBvcnQgY29uc3QgbXNwSWQgPSBwcm9jZXNzLmVudi5NU1BfSUQgfHwgJ09yZzFNU1AnO1xyXG5cclxuLy8gVXNlciBpZGVudGl0eSB0byB1c2UgZm9yIEFQSSBvcGVyYXRpb25zXHJcbmV4cG9ydCBjb25zdCB1c2VySWQgPSBwcm9jZXNzLmVudi5GQUJSSUNfVVNFUl9JRCB8fCAnYXBwVXNlcic7XHJcblxyXG4vLyBXYWxsZXQgY29uZmlndXJhdGlvblxyXG5leHBvcnQgY29uc3Qgd2FsbGV0UGF0aCA9IHByb2Nlc3MuZW52LldBTExFVF9QQVRIIHx8ICd3YWxsZXQnO1xyXG5cclxuLy8gQ29ubmVjdGlvbiBwcm9maWxlXHJcbmV4cG9ydCBjb25zdCBjb25uZWN0aW9uUHJvZmlsZVBhdGggPSBwcm9jZXNzLmVudi5DT05ORUNUSU9OX1BST0ZJTEVfUEFUSCB8fCBcclxuICAgIHBhdGguam9pbignZmFicmljLXNhbXBsZXMnLCAndGVzdC1uZXR3b3JrJywgJ29yZ2FuaXphdGlvbnMnLCAncGVlck9yZ2FuaXphdGlvbnMnLCAnb3JnMS5leGFtcGxlLmNvbScsICdjb25uZWN0aW9uLW9yZzEuanNvbicpO1xyXG5cclxuLy8gTmV0d29yayBjb25maWd1cmF0aW9uXHJcbmV4cG9ydCBjb25zdCBhc0xvY2FsaG9zdCA9IHByb2Nlc3MuZW52LkFTX0xPQ0FMSE9TVCA/IHByb2Nlc3MuZW52LkFTX0xPQ0FMSE9TVCA9PT0gJ3RydWUnIDogdHJ1ZTtcclxuXHJcbi8vIFNlcnZlciBjb25maWd1cmF0aW9uXHJcbmV4cG9ydCBjb25zdCBwb3J0ID0gcHJvY2Vzcy5lbnYuUE9SVCB8fCAzMDAwO1xyXG5leHBvcnQgY29uc3QgaG9zdCA9IHByb2Nlc3MuZW52LkhPU1QgfHwgJ2xvY2FsaG9zdCc7XHJcblxyXG4vLyBMb2cgbGV2ZWxcclxuZXhwb3J0IGNvbnN0IGxvZ0xldmVsID0gcHJvY2Vzcy5lbnYuTE9HX0xFVkVMIHx8ICdpbmZvJztcclxuXHJcbi8vIEFQSSBwYXRoc1xyXG5leHBvcnQgY29uc3QgYXBpUHJlZml4ID0gJy9hcGknO1xyXG5leHBvcnQgY29uc3QgYXBpVmVyc2lvbiA9ICcvdjEnO1xyXG5leHBvcnQgY29uc3QgYmFzZUFwaVBhdGggPSBhcGlQcmVmaXggKyBhcGlWZXJzaW9uO1xyXG5cclxuLy8gVGltZW91dHMgKGluIHNlY29uZHMpXHJcbmV4cG9ydCBjb25zdCBxdWVyeVRpbWVvdXQgPSBOdW1iZXIocHJvY2Vzcy5lbnYuUVVFUllfVElNRU9VVCB8fCAxMjApO1xyXG5leHBvcnQgY29uc3QgZW5kb3JzZVRpbWVvdXQgPSBOdW1iZXIocHJvY2Vzcy5lbnYuRU5ET1JTRV9USU1FT1VUIHx8IDEyMCk7XHJcbmV4cG9ydCBjb25zdCBzdWJtaXRUaW1lb3V0ID0gTnVtYmVyKHByb2Nlc3MuZW52LlNVQk1JVF9USU1FT1VUIHx8IDEyMCk7XHJcbmV4cG9ydCBjb25zdCBjb21taXRUaW1lb3V0ID0gTnVtYmVyKHByb2Nlc3MuZW52LkNPTU1JVF9USU1FT1VUIHx8IDYwMCk7ICJdfQ==