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
exports.Appointment = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
let Appointment = class Appointment {
    docType;
    ID = '';
    userID = ''; // ID of the donor or patient
    userType = ''; // 'donor' or 'patient'
    bloodBankID = '';
    appointmentDate = '';
    appointmentTime = '';
    purpose = ''; // 'donation' or 'transfusion'
    status = 'scheduled'; // scheduled, completed, cancelled
    tokenID = '';
    notes = '';
};
exports.Appointment = Appointment;
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Appointment.prototype, "docType", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Appointment.prototype, "ID", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Appointment.prototype, "userID", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Appointment.prototype, "userType", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Appointment.prototype, "bloodBankID", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Appointment.prototype, "appointmentDate", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Appointment.prototype, "appointmentTime", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Appointment.prototype, "purpose", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Appointment.prototype, "status", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Appointment.prototype, "tokenID", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)(),
    __metadata("design:type", String)
], Appointment.prototype, "notes", void 0);
exports.Appointment = Appointment = __decorate([
    (0, fabric_contract_api_1.Object)()
], Appointment);
//# sourceMappingURL=appointment.js.map