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
exports.BloodBank = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
let BloodBank = class BloodBank {
    docType;
    ID = '';
    name = '';
    address = '';
    phone = '';
    email = '';
    latitude = '';
    longitude = '';
    openingTime = '';
    closingTime = '';
    inventory = ''; // JSON string of inventory by blood type
    status = 'active';
};
exports.BloodBank = BloodBank;
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodBank.prototype, "docType", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodBank.prototype, "ID", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodBank.prototype, "name", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodBank.prototype, "address", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodBank.prototype, "phone", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodBank.prototype, "email", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodBank.prototype, "latitude", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodBank.prototype, "longitude", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodBank.prototype, "openingTime", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodBank.prototype, "closingTime", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodBank.prototype, "inventory", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], BloodBank.prototype, "status", void 0);
exports.BloodBank = BloodBank = __decorate([
    (0, fabric_contract_api_1.Object)()
], BloodBank);
//# sourceMappingURL=bloodBank.js.map