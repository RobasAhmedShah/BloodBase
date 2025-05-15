"use strict";
/*
 * SPDX-License-Identifier: Apache-2.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.donorsRouter = void 0;
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const fabric_1 = require("../fabric");
const { OK, INTERNAL_SERVER_ERROR } = http_status_codes_1.StatusCodes;
exports.donorsRouter = express_1.default.Router();
/**
 * Get all donors
 */
exports.donorsRouter.get('/', async (req, res) => {
    console.log('Get all donors request received');
    try {
        const contract = req.app.locals.contract;
        const result = await (0, fabric_1.evaluateTransaction)(contract, 'GetAllDonors');
        const donors = JSON.parse(Buffer.from(result).toString());
        return res.status(OK).json(donors);
    }
    catch (error) {
        console.error('Error getting all donors:', error);
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: 'Internal Server Error',
            message: error?.message || 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9ub3JzLnJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXMvZG9ub3JzLnJvdXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7OztBQUVILHNEQUFxRDtBQUNyRCx5REFBZ0Q7QUFFaEQsc0NBQWdEO0FBRWhELE1BQU0sRUFBRSxFQUFFLEVBQUUscUJBQXFCLEVBQUUsR0FBRywrQkFBVyxDQUFDO0FBRXJDLFFBQUEsWUFBWSxHQUFHLGlCQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFN0M7O0dBRUc7QUFDSCxvQkFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQVksRUFBRSxHQUFhLEVBQUUsRUFBRTtJQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFFL0MsSUFBSSxDQUFDO1FBQ0QsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBb0IsQ0FBQztRQUVyRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsNEJBQW1CLEVBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRTFELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7UUFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsRCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDMUMsTUFBTSxFQUFFLHVCQUF1QjtZQUMvQixPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sSUFBSSxlQUFlO1lBQzFDLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtTQUN0QyxDQUFDLENBQUM7SUFDUCxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxyXG4gKi9cclxuXHJcbmltcG9ydCBleHByZXNzLCB7IFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcyc7XHJcbmltcG9ydCB7IFN0YXR1c0NvZGVzIH0gZnJvbSAnaHR0cC1zdGF0dXMtY29kZXMnO1xyXG5pbXBvcnQgeyBDb250cmFjdCB9IGZyb20gJ0BoeXBlcmxlZGdlci9mYWJyaWMtZ2F0ZXdheSc7XHJcbmltcG9ydCB7IGV2YWx1YXRlVHJhbnNhY3Rpb24gfSBmcm9tICcuLi9mYWJyaWMnO1xyXG5cclxuY29uc3QgeyBPSywgSU5URVJOQUxfU0VSVkVSX0VSUk9SIH0gPSBTdGF0dXNDb2RlcztcclxuXHJcbmV4cG9ydCBjb25zdCBkb25vcnNSb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xyXG5cclxuLyoqXHJcbiAqIEdldCBhbGwgZG9ub3JzXHJcbiAqL1xyXG5kb25vcnNSb3V0ZXIuZ2V0KCcvJywgYXN5bmMgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ0dldCBhbGwgZG9ub3JzIHJlcXVlc3QgcmVjZWl2ZWQnKTtcclxuICAgIFxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBjb250cmFjdCA9IHJlcS5hcHAubG9jYWxzLmNvbnRyYWN0IGFzIENvbnRyYWN0O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV2YWx1YXRlVHJhbnNhY3Rpb24oY29udHJhY3QsICdHZXRBbGxEb25vcnMnKTtcclxuICAgICAgICBjb25zdCBkb25vcnMgPSBKU09OLnBhcnNlKEJ1ZmZlci5mcm9tKHJlc3VsdCkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoT0spLmpzb24oZG9ub3JzKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGFsbCBkb25vcnM6JywgZXJyb3IpO1xyXG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKElOVEVSTkFMX1NFUlZFUl9FUlJPUikuanNvbih7XHJcbiAgICAgICAgICAgIHN0YXR1czogJ0ludGVybmFsIFNlcnZlciBFcnJvcicsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yPy5tZXNzYWdlIHx8ICdVbmtub3duIGVycm9yJyxcclxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSk7ICJdfQ==