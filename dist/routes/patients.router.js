"use strict";
/*
 * SPDX-License-Identifier: Apache-2.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientsRouter = void 0;
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const fabric_1 = require("../fabric");
const { OK, INTERNAL_SERVER_ERROR } = http_status_codes_1.StatusCodes;
exports.patientsRouter = express_1.default.Router();
/**
 * Get all patients
 */
exports.patientsRouter.get('/', async (req, res) => {
    console.log('Get all patients request received');
    try {
        const contract = req.app.locals.contract;
        const result = await (0, fabric_1.evaluateTransaction)(contract, 'GetAllPatients');
        const patients = JSON.parse(Buffer.from(result).toString());
        return res.status(OK).json(patients);
    }
    catch (error) {
        console.error('Error getting all patients:', error);
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: 'Internal Server Error',
            message: error?.message || 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aWVudHMucm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JvdXRlcy9wYXRpZW50cy5yb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7Ozs7QUFFSCxzREFBcUQ7QUFDckQseURBQWdEO0FBRWhELHNDQUFnRDtBQUVoRCxNQUFNLEVBQUUsRUFBRSxFQUFFLHFCQUFxQixFQUFFLEdBQUcsK0JBQVcsQ0FBQztBQUVyQyxRQUFBLGNBQWMsR0FBRyxpQkFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRS9DOztHQUVHO0FBQ0gsc0JBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFZLEVBQUUsR0FBYSxFQUFFLEVBQUU7SUFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0lBRWpELElBQUksQ0FBQztRQUNELE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQW9CLENBQUM7UUFFckQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLDRCQUFtQixFQUFDLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRTVELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7UUFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwRCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDMUMsTUFBTSxFQUFFLHVCQUF1QjtZQUMvQixPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sSUFBSSxlQUFlO1lBQzFDLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtTQUN0QyxDQUFDLENBQUM7SUFDUCxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxyXG4gKi9cclxuXHJcbmltcG9ydCBleHByZXNzLCB7IFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcyc7XHJcbmltcG9ydCB7IFN0YXR1c0NvZGVzIH0gZnJvbSAnaHR0cC1zdGF0dXMtY29kZXMnO1xyXG5pbXBvcnQgeyBDb250cmFjdCB9IGZyb20gJ0BoeXBlcmxlZGdlci9mYWJyaWMtZ2F0ZXdheSc7XHJcbmltcG9ydCB7IGV2YWx1YXRlVHJhbnNhY3Rpb24gfSBmcm9tICcuLi9mYWJyaWMnO1xyXG5cclxuY29uc3QgeyBPSywgSU5URVJOQUxfU0VSVkVSX0VSUk9SIH0gPSBTdGF0dXNDb2RlcztcclxuXHJcbmV4cG9ydCBjb25zdCBwYXRpZW50c1JvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XHJcblxyXG4vKipcclxuICogR2V0IGFsbCBwYXRpZW50c1xyXG4gKi9cclxucGF0aWVudHNSb3V0ZXIuZ2V0KCcvJywgYXN5bmMgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ0dldCBhbGwgcGF0aWVudHMgcmVxdWVzdCByZWNlaXZlZCcpO1xyXG4gICAgXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGNvbnRyYWN0ID0gcmVxLmFwcC5sb2NhbHMuY29udHJhY3QgYXMgQ29udHJhY3Q7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXZhbHVhdGVUcmFuc2FjdGlvbihjb250cmFjdCwgJ0dldEFsbFBhdGllbnRzJyk7XHJcbiAgICAgICAgY29uc3QgcGF0aWVudHMgPSBKU09OLnBhcnNlKEJ1ZmZlci5mcm9tKHJlc3VsdCkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoT0spLmpzb24ocGF0aWVudHMpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYWxsIHBhdGllbnRzOicsIGVycm9yKTtcclxuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyhJTlRFUk5BTF9TRVJWRVJfRVJST1IpLmpzb24oe1xyXG4gICAgICAgICAgICBzdGF0dXM6ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvcj8ubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcicsXHJcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pOyAiXX0=