"use strict";
/*
 * SPDX-License-Identifier: Apache-2.0
 */
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
exports.BloodUnit = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
let BloodUnit = class BloodUnit {
    docType;
    ID = '';
    donorID = '';
    bloodType = '';
    volume = '450'; // Default volume in ml
    collectionDate = '';
    expiryDate = '';
    status = 'available'; // available, used, expired, discarded
    bloodBankID = '';
    testResults = ''; // JSON string of test results
    rfidTag = '';
};
exports.BloodUnit = BloodUnit;
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodUnit.prototype, "docType", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodUnit.prototype, "ID", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodUnit.prototype, "donorID", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodUnit.prototype, "bloodType", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodUnit.prototype, "volume", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodUnit.prototype, "collectionDate", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodUnit.prototype, "expiryDate", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodUnit.prototype, "status", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodUnit.prototype, "bloodBankID", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodUnit.prototype, "testResults", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodUnit.prototype, "rfidTag", void 0);
exports.BloodUnit = BloodUnit = __decorate([
    (0, fabric_contract_api_1.Object)()
], BloodUnit);
//# sourceMappingURL=bloodUnit.js.map