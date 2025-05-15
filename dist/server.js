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
exports.createServer = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const http_status_codes_1 = require("http-status-codes");
const cors_1 = __importDefault(require("cors"));
const config = __importStar(require("./config"));
// Import router files
const donations_router_1 = require("./routes/donations.router");
const donors_router_1 = require("./routes/donors.router");
const appointments_router_1 = require("./routes/appointments.router");
const patients_router_1 = require("./routes/patients.router");
const health_router_1 = require("./routes/health.router");
const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = http_status_codes_1.StatusCodes;
/**
 * Create and configure Express server
 */
const createServer = async () => {
    const app = (0, express_1.default)();
    // Middleware
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // Configure CORS
    const corsOptions = {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    };
    app.use((0, cors_1.default)(corsOptions));
    // Security middleware
    if (process.env.NODE_ENV === 'production') {
        app.use((0, helmet_1.default)());
    }
    // API routes
    app.use('/health', health_router_1.healthRouter);
    app.use(`${config.baseApiPath}/donations`, donations_router_1.donationsRouter);
    app.use(`${config.baseApiPath}/donors`, donors_router_1.donorsRouter);
    app.use(`${config.baseApiPath}/appointments`, appointments_router_1.appointmentsRouter);
    app.use(`${config.baseApiPath}/patients`, patients_router_1.patientsRouter);
    // For everything else
    app.use((_req, res) => {
        return res.status(NOT_FOUND).json({
            status: 'Not Found',
            message: 'Requested resource not found',
            timestamp: new Date().toISOString()
        });
    });
    // Generic error handler
    app.use((err, _req, res, _next) => {
        console.error('Unhandled error:', err);
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: 'Internal Server Error',
            message: 'An unexpected error occurred',
            timestamp: new Date().toISOString()
        });
    });
    return app;
};
exports.createServer = createServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILHNEQUFnRjtBQUNoRixvREFBNEI7QUFDNUIseURBQWdEO0FBQ2hELGdEQUF3QjtBQUN4QixpREFBbUM7QUFFbkMsc0JBQXNCO0FBQ3RCLGdFQUE0RDtBQUM1RCwwREFBc0Q7QUFDdEQsc0VBQWtFO0FBQ2xFLDhEQUEwRDtBQUMxRCwwREFBc0Q7QUFFdEQsTUFBTSxFQUFFLFdBQVcsRUFBRSxxQkFBcUIsRUFBRSxTQUFTLEVBQUUsR0FBRywrQkFBVyxDQUFDO0FBRXRFOztHQUVHO0FBQ0ksTUFBTSxZQUFZLEdBQUcsS0FBSyxJQUEwQixFQUFFO0lBQ3pELE1BQU0sR0FBRyxHQUFHLElBQUEsaUJBQU8sR0FBRSxDQUFDO0lBRXRCLGFBQWE7SUFDYixHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN4QixHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUVoRCxpQkFBaUI7SUFDakIsTUFBTSxXQUFXLEdBQUc7UUFDaEIsTUFBTSxFQUFFLEdBQUc7UUFDWCxPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDO1FBQ3BELGNBQWMsRUFBRSxDQUFDLGNBQWMsRUFBRSxlQUFlLENBQUM7S0FDcEQsQ0FBQztJQUNGLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBQSxjQUFJLEVBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUUzQixzQkFBc0I7SUFDdEIsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxZQUFZLEVBQUUsQ0FBQztRQUN4QyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUEsZ0JBQU0sR0FBRSxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELGFBQWE7SUFDYixHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSw0QkFBWSxDQUFDLENBQUM7SUFDakMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLFlBQVksRUFBRSxrQ0FBZSxDQUFDLENBQUM7SUFDNUQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLFNBQVMsRUFBRSw0QkFBWSxDQUFDLENBQUM7SUFDdEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLGVBQWUsRUFBRSx3Q0FBa0IsQ0FBQyxDQUFDO0lBQ2xFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsV0FBVyxXQUFXLEVBQUUsZ0NBQWMsQ0FBQyxDQUFDO0lBRTFELHNCQUFzQjtJQUN0QixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ2xCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDOUIsTUFBTSxFQUFFLFdBQVc7WUFDbkIsT0FBTyxFQUFFLDhCQUE4QjtZQUN2QyxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7U0FDdEMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCx3QkFBd0I7SUFDeEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQVUsRUFBRSxJQUFhLEVBQUUsR0FBYSxFQUFFLEtBQW1CLEVBQUUsRUFBRTtRQUN0RSxPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUMxQyxNQUFNLEVBQUUsdUJBQXVCO1lBQy9CLE9BQU8sRUFBRSw4QkFBOEI7WUFDdkMsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO1NBQ3RDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDLENBQUM7QUEvQ1csUUFBQSxZQUFZLGdCQStDdkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxyXG4gKi9cclxuXHJcbmltcG9ydCBleHByZXNzLCB7IEFwcGxpY2F0aW9uLCBOZXh0RnVuY3Rpb24sIFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcyc7XHJcbmltcG9ydCBoZWxtZXQgZnJvbSAnaGVsbWV0JztcclxuaW1wb3J0IHsgU3RhdHVzQ29kZXMgfSBmcm9tICdodHRwLXN0YXR1cy1jb2Rlcyc7XHJcbmltcG9ydCBjb3JzIGZyb20gJ2NvcnMnO1xyXG5pbXBvcnQgKiBhcyBjb25maWcgZnJvbSAnLi9jb25maWcnO1xyXG5cclxuLy8gSW1wb3J0IHJvdXRlciBmaWxlc1xyXG5pbXBvcnQgeyBkb25hdGlvbnNSb3V0ZXIgfSBmcm9tICcuL3JvdXRlcy9kb25hdGlvbnMucm91dGVyJztcclxuaW1wb3J0IHsgZG9ub3JzUm91dGVyIH0gZnJvbSAnLi9yb3V0ZXMvZG9ub3JzLnJvdXRlcic7XHJcbmltcG9ydCB7IGFwcG9pbnRtZW50c1JvdXRlciB9IGZyb20gJy4vcm91dGVzL2FwcG9pbnRtZW50cy5yb3V0ZXInO1xyXG5pbXBvcnQgeyBwYXRpZW50c1JvdXRlciB9IGZyb20gJy4vcm91dGVzL3BhdGllbnRzLnJvdXRlcic7XHJcbmltcG9ydCB7IGhlYWx0aFJvdXRlciB9IGZyb20gJy4vcm91dGVzL2hlYWx0aC5yb3V0ZXInO1xyXG5cclxuY29uc3QgeyBCQURfUkVRVUVTVCwgSU5URVJOQUxfU0VSVkVSX0VSUk9SLCBOT1RfRk9VTkQgfSA9IFN0YXR1c0NvZGVzO1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhbmQgY29uZmlndXJlIEV4cHJlc3Mgc2VydmVyXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgY3JlYXRlU2VydmVyID0gYXN5bmMgKCk6IFByb21pc2U8QXBwbGljYXRpb24+ID0+IHtcclxuICAgIGNvbnN0IGFwcCA9IGV4cHJlc3MoKTtcclxuXHJcbiAgICAvLyBNaWRkbGV3YXJlXHJcbiAgICBhcHAudXNlKGV4cHJlc3MuanNvbigpKTtcclxuICAgIGFwcC51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUgfSkpO1xyXG4gICAgXHJcbiAgICAvLyBDb25maWd1cmUgQ09SU1xyXG4gICAgY29uc3QgY29yc09wdGlvbnMgPSB7XHJcbiAgICAgICAgb3JpZ2luOiAnKicsXHJcbiAgICAgICAgbWV0aG9kczogWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ09QVElPTlMnXSxcclxuICAgICAgICBhbGxvd2VkSGVhZGVyczogWydDb250ZW50LVR5cGUnLCAnQXV0aG9yaXphdGlvbiddXHJcbiAgICB9O1xyXG4gICAgYXBwLnVzZShjb3JzKGNvcnNPcHRpb25zKSk7XHJcblxyXG4gICAgLy8gU2VjdXJpdHkgbWlkZGxld2FyZVxyXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHtcclxuICAgICAgICBhcHAudXNlKGhlbG1ldCgpKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBUEkgcm91dGVzXHJcbiAgICBhcHAudXNlKCcvaGVhbHRoJywgaGVhbHRoUm91dGVyKTtcclxuICAgIGFwcC51c2UoYCR7Y29uZmlnLmJhc2VBcGlQYXRofS9kb25hdGlvbnNgLCBkb25hdGlvbnNSb3V0ZXIpO1xyXG4gICAgYXBwLnVzZShgJHtjb25maWcuYmFzZUFwaVBhdGh9L2Rvbm9yc2AsIGRvbm9yc1JvdXRlcik7XHJcbiAgICBhcHAudXNlKGAke2NvbmZpZy5iYXNlQXBpUGF0aH0vYXBwb2ludG1lbnRzYCwgYXBwb2ludG1lbnRzUm91dGVyKTtcclxuICAgIGFwcC51c2UoYCR7Y29uZmlnLmJhc2VBcGlQYXRofS9wYXRpZW50c2AsIHBhdGllbnRzUm91dGVyKTtcclxuXHJcbiAgICAvLyBGb3IgZXZlcnl0aGluZyBlbHNlXHJcbiAgICBhcHAudXNlKChfcmVxLCByZXMpID0+IHtcclxuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyhOT1RfRk9VTkQpLmpzb24oe1xyXG4gICAgICAgICAgICBzdGF0dXM6ICdOb3QgRm91bmQnLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnUmVxdWVzdGVkIHJlc291cmNlIG5vdCBmb3VuZCcsXHJcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHZW5lcmljIGVycm9yIGhhbmRsZXJcclxuICAgIGFwcC51c2UoKGVycjogRXJyb3IsIF9yZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIF9uZXh0OiBOZXh0RnVuY3Rpb24pID0+IHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdVbmhhbmRsZWQgZXJyb3I6JywgZXJyKTtcclxuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyhJTlRFUk5BTF9TRVJWRVJfRVJST1IpLmpzb24oe1xyXG4gICAgICAgICAgICBzdGF0dXM6ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZCcsXHJcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gYXBwO1xyXG59OyAiXX0=