"use strict";
/*
 * SPDX-License-Identifier: Apache-2.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentsRouter = void 0;
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const fabric_1 = require("../fabric");
const { OK, INTERNAL_SERVER_ERROR } = http_status_codes_1.StatusCodes;
exports.appointmentsRouter = express_1.default.Router();
/**
 * Get all appointments
 */
exports.appointmentsRouter.get('/', async (req, res) => {
    console.log('Get all appointments request received');
    try {
        const contract = req.app.locals.contract;
        const result = await (0, fabric_1.evaluateTransaction)(contract, 'GetAllAppointments');
        const appointments = JSON.parse(Buffer.from(result).toString());
        return res.status(OK).json(appointments);
    }
    catch (error) {
        console.error('Error getting all appointments:', error);
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: 'Internal Server Error',
            message: error?.message || 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwb2ludG1lbnRzLnJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXMvYXBwb2ludG1lbnRzLnJvdXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7OztBQUVILHNEQUFxRDtBQUNyRCx5REFBZ0Q7QUFFaEQsc0NBQWdEO0FBRWhELE1BQU0sRUFBRSxFQUFFLEVBQUUscUJBQXFCLEVBQUUsR0FBRywrQkFBVyxDQUFDO0FBRXJDLFFBQUEsa0JBQWtCLEdBQUcsaUJBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUVuRDs7R0FFRztBQUNILDBCQUFrQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQVksRUFBRSxHQUFhLEVBQUUsRUFBRTtJQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7SUFFckQsSUFBSSxDQUFDO1FBQ0QsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBb0IsQ0FBQztRQUVyRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsNEJBQW1CLEVBQUMsUUFBUSxFQUFFLG9CQUFvQixDQUFDLENBQUM7UUFDekUsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFaEUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUMxQyxNQUFNLEVBQUUsdUJBQXVCO1lBQy9CLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxJQUFJLGVBQWU7WUFDMUMsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO1NBQ3RDLENBQUMsQ0FBQztJQUNQLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXHJcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXHJcbiAqL1xyXG5cclxuaW1wb3J0IGV4cHJlc3MsIHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcclxuaW1wb3J0IHsgU3RhdHVzQ29kZXMgfSBmcm9tICdodHRwLXN0YXR1cy1jb2Rlcyc7XHJcbmltcG9ydCB7IENvbnRyYWN0IH0gZnJvbSAnQGh5cGVybGVkZ2VyL2ZhYnJpYy1nYXRld2F5JztcclxuaW1wb3J0IHsgZXZhbHVhdGVUcmFuc2FjdGlvbiB9IGZyb20gJy4uL2ZhYnJpYyc7XHJcblxyXG5jb25zdCB7IE9LLCBJTlRFUk5BTF9TRVJWRVJfRVJST1IgfSA9IFN0YXR1c0NvZGVzO1xyXG5cclxuZXhwb3J0IGNvbnN0IGFwcG9pbnRtZW50c1JvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XHJcblxyXG4vKipcclxuICogR2V0IGFsbCBhcHBvaW50bWVudHNcclxuICovXHJcbmFwcG9pbnRtZW50c1JvdXRlci5nZXQoJy8nLCBhc3luYyAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnR2V0IGFsbCBhcHBvaW50bWVudHMgcmVxdWVzdCByZWNlaXZlZCcpO1xyXG4gICAgXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGNvbnRyYWN0ID0gcmVxLmFwcC5sb2NhbHMuY29udHJhY3QgYXMgQ29udHJhY3Q7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXZhbHVhdGVUcmFuc2FjdGlvbihjb250cmFjdCwgJ0dldEFsbEFwcG9pbnRtZW50cycpO1xyXG4gICAgICAgIGNvbnN0IGFwcG9pbnRtZW50cyA9IEpTT04ucGFyc2UoQnVmZmVyLmZyb20ocmVzdWx0KS50b1N0cmluZygpKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyhPSykuanNvbihhcHBvaW50bWVudHMpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYWxsIGFwcG9pbnRtZW50czonLCBlcnJvcik7XHJcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoSU5URVJOQUxfU0VSVkVSX0VSUk9SKS5qc29uKHtcclxuICAgICAgICAgICAgc3RhdHVzOiAnSW50ZXJuYWwgU2VydmVyIEVycm9yJyxcclxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3I/Lm1lc3NhZ2UgfHwgJ1Vua25vd24gZXJyb3InLFxyXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTsgIl19