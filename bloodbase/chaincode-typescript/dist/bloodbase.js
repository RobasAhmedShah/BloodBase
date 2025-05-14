"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BloodBase = void 0;
require("reflect-metadata");
const fabric_contract_api_1 = require("fabric-contract-api");
let BloodBase = class BloodBase extends fabric_contract_api_1.Contract {
    constructor() {
        super(...arguments);
        this.USER_PREFIX = 'USER:';
        this.DONATION_PREFIX = 'DONATION:';
    }
    async RegisterUser(ctx, userID, bloodType, ipfsCID) {
        // Check if user already exists
        const userKey = this.USER_PREFIX + userID;
        const existingUser = await ctx.stub.getState(userKey);
        if (existingUser && existingUser.length > 0) {
            throw new Error(`User ${userID} already exists`);
        }
        // Create new user
        const user = {
            userID,
            bloodType,
            ipfsCID,
            timestamp: new Date().toISOString(),
            isActive: true
        };
        // Store user data
        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
        // Emit event
        ctx.stub.setEvent('UserRegistered', Buffer.from(JSON.stringify({
            userID,
            timestamp: user.timestamp
        })));
    }
    async RecordDonation(ctx, donorID, tokenID) {
        // Verify donor exists
        const userKey = this.USER_PREFIX + donorID;
        const userBytes = await ctx.stub.getState(userKey);
        if (!userBytes || userBytes.length === 0) {
            throw new Error(`Donor ${donorID} does not exist`);
        }
        // Calculate expiry date (35 days from now)
        const timestamp = new Date();
        const expiryDate = new Date(timestamp);
        expiryDate.setDate(expiryDate.getDate() + 35);
        // Create donation record
        const donation = {
            donorID,
            tokenID,
            timestamp: timestamp.toISOString(),
            status: 'COLLECTED',
            expiryDate: expiryDate.toISOString()
        };
        // Store donation data using composite key
        const donationKey = this.DONATION_PREFIX + donorID + ':' + tokenID;
        await ctx.stub.putState(donationKey, Buffer.from(JSON.stringify(donation)));
        // Emit event
        ctx.stub.setEvent('DonationRecorded', Buffer.from(JSON.stringify({
            donorID,
            tokenID,
            timestamp: donation.timestamp
        })));
    }
    async ReadUser(ctx, userID) {
        const userKey = this.USER_PREFIX + userID;
        const userBytes = await ctx.stub.getState(userKey);
        if (!userBytes || userBytes.length === 0) {
            throw new Error(`User ${userID} does not exist`);
        }
        return userBytes.toString();
    }
    async ReadDonation(ctx, donorID, tokenID) {
        const donationKey = this.DONATION_PREFIX + donorID + ':' + tokenID;
        const donationBytes = await ctx.stub.getState(donationKey);
        if (!donationBytes || donationBytes.length === 0) {
            throw new Error(`Donation record not found for donor ${donorID} and token ${tokenID}`);
        }
        return donationBytes.toString();
    }
    async GetDonorHistory(ctx, donorID) {
        const iterator = await ctx.stub.getStateByPartialCompositeKey(this.DONATION_PREFIX, [donorID]);
        const donations = [];
        while (true) {
            const result = await iterator.next();
            if (result.value) {
                const donation = JSON.parse(result.value.value.toString());
                donations.push(donation);
            }
            if (result.done) {
                await iterator.close();
                break;
            }
        }
        return JSON.stringify(donations);
    }
    async UpdateDonationStatus(ctx, donorID, tokenID, newStatus) {
        const donationKey = this.DONATION_PREFIX + donorID + ':' + tokenID;
        const donationBytes = await ctx.stub.getState(donationKey);
        if (!donationBytes || donationBytes.length === 0) {
            throw new Error(`Donation record not found for donor ${donorID} and token ${tokenID}`);
        }
        const donation = JSON.parse(donationBytes.toString());
        donation.status = newStatus;
        await ctx.stub.putState(donationKey, Buffer.from(JSON.stringify(donation)));
        // Emit event
        ctx.stub.setEvent('DonationStatusUpdated', Buffer.from(JSON.stringify({
            donorID,
            tokenID,
            newStatus,
            timestamp: new Date().toISOString()
        })));
    }
};
exports.BloodBase = BloodBase;
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "RegisterUser", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "RecordDonation", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "ReadUser", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "ReadDonation", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "GetDonorHistory", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "UpdateDonationStatus", null);
exports.BloodBase = BloodBase = __decorate([
    (0, fabric_contract_api_1.Info)({ title: 'BloodBase', description: 'Smart contract for blood donation management' })
], BloodBase);
