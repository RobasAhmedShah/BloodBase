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
exports.Patient = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
let Patient = class Patient {
    docType;
    ID = '';
    name = '';
    cnic = '';
    bloodType = '';
    phone = '';
    email = '';
    address = '';
    dateOfBirth = '';
    medicalHistory = '';
    doctorPrescription = '';
    eligibilityStatus = 'pending';
    registrationDate = '';
    totalTransfusions = '0';
};
exports.Patient = Patient;
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Patient.prototype, "docType", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Patient.prototype, "ID", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Patient.prototype, "name", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Patient.prototype, "cnic", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Patient.prototype, "bloodType", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Patient.prototype, "phone", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Patient.prototype, "email", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Patient.prototype, "address", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Patient.prototype, "dateOfBirth", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Patient.prototype, "medicalHistory", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Patient.prototype, "doctorPrescription", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Patient.prototype, "eligibilityStatus", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Patient.prototype, "registrationDate", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Patient.prototype, "totalTransfusions", void 0);
exports.Patient = Patient = __decorate([
    (0, fabric_contract_api_1.Object)()
], Patient);
//# sourceMappingURL=patient.js.map