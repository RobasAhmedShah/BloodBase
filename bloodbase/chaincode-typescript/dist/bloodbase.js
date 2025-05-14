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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BloodBase = void 0;
/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
const fabric_contract_api_1 = require("fabric-contract-api");
const json_stringify_deterministic_1 = __importDefault(require("json-stringify-deterministic"));
const sort_keys_recursive_1 = __importDefault(require("sort-keys-recursive"));
let BloodBase = class BloodBase extends fabric_contract_api_1.Contract {
    // Initialize the ledger with some donations
    async InitLedger(ctx) {
        const donations = [
            {
                ID: 'donation1',
                donorID: 'donor1',
                bloodType: 'O+',
                timestamp: '2025-01-01T12:00:00Z',
                status: 'available',
                docType: 'donation'
            },
            {
                ID: 'donation2',
                donorID: 'donor2',
                bloodType: 'A+',
                timestamp: '2025-01-02T12:00:00Z',
                status: 'available',
                docType: 'donation'
            }
        ];
        for (const donation of donations) {
            // Use ID as the key, like in the reference code
            await ctx.stub.putState(donation.ID, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(donation))));
            console.info(`Donation ${donation.ID} initialized`);
        }
    }
    // CreateDonation issues a new donation to the world state with given details.
    async CreateDonation(ctx, id, donorID, bloodType, timestamp) {
        console.info(`Creating donation ${id} with donor ${donorID}`);
        // Check if the donation already exists
        const exists = await this.DonationExists(ctx, id);
        if (exists) {
            throw new Error(`The donation ${id} already exists`);
        }
        // Create donation object
        const donation = {
            ID: id,
            donorID,
            bloodType,
            timestamp,
            status: 'available',
            docType: 'donation'
        };
        // Store using ID as key, directly mirroring the reference implementation
        await ctx.stub.putState(id, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(donation))));
        console.info(`Donation ${id} has been created`);
    }
    // ReadDonation returns the donation stored in the world state with given id.
    async ReadDonation(ctx, id) {
        console.info(`Reading donation ${id}`);
        const donationJSON = await ctx.stub.getState(id);
        if (!donationJSON || donationJSON.length === 0) {
            throw new Error(`The donation ${id} does not exist`);
        }
        console.info(`Donation ${id} found`);
        return donationJSON.toString();
    }
    // UpdateDonationStatus updates the status of an existing donation in the world state.
    async UpdateDonationStatus(ctx, id, newStatus) {
        console.info(`Updating donation ${id} status to ${newStatus}`);
        // Check if donation exists
        const exists = await this.DonationExists(ctx, id);
        if (!exists) {
            throw new Error(`The donation ${id} does not exist`);
        }
        // Get current state
        const donationString = await this.ReadDonation(ctx, id);
        const donation = JSON.parse(donationString);
        // Update status
        donation.status = newStatus;
        // Save updated donation
        await ctx.stub.putState(id, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(donation))));
        console.info(`Donation ${id} status updated to ${newStatus}`);
    }
    // DeleteDonation deletes a given donation from the world state.
    async DeleteDonation(ctx, id) {
        console.info(`Deleting donation ${id}`);
        // Check if donation exists
        const exists = await this.DonationExists(ctx, id);
        if (!exists) {
            throw new Error(`The donation ${id} does not exist`);
        }
        // Delete state directly by ID
        await ctx.stub.deleteState(id);
        console.info(`Donation ${id} has been deleted`);
    }
    // DonationExists returns true when donation with given ID exists in world state.
    async DonationExists(ctx, id) {
        const donationJSON = await ctx.stub.getState(id);
        return donationJSON && donationJSON.length > 0;
    }
    // GetAllDonations returns all donations found in the world state.
    async GetAllDonations(ctx) {
        console.info('Getting all donations');
        const allResults = [];
        // Use standard range query like in the reference code
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Only include donation objects
                if (record.docType === 'donation') {
                    allResults.push(record);
                }
            }
            catch (err) {
                console.error(`Error parsing: ${err}`);
            }
            result = await iterator.next();
        }
        // Close the iterator
        await iterator.close();
        console.info(`Found ${allResults.length} donations`);
        return JSON.stringify(allResults);
    }
};
exports.BloodBase = BloodBase;
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "InitLedger", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "CreateDonation", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "ReadDonation", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "UpdateDonationStatus", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "DeleteDonation", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('boolean'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "DonationExists", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "GetAllDonations", null);
exports.BloodBase = BloodBase = __decorate([
    (0, fabric_contract_api_1.Info)({ title: 'BloodBase', description: 'Smart contract for blood donation management' })
], BloodBase);
//# sourceMappingURL=bloodbase.js.map