"use strict";
/*
 * SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.contracts = exports.Appointment = exports.Patient = exports.Donor = exports.BloodDonation = void 0;
const bloodbase_1 = require("./bloodbase");
// Export all models
var bloodDonation_1 = require("./bloodDonation");
Object.defineProperty(exports, "BloodDonation", { enumerable: true, get: function () { return bloodDonation_1.BloodDonation; } });
var donor_1 = require("./donor");
Object.defineProperty(exports, "Donor", { enumerable: true, get: function () { return donor_1.Donor; } });
var patient_1 = require("./patient");
Object.defineProperty(exports, "Patient", { enumerable: true, get: function () { return patient_1.Patient; } });
var appointment_1 = require("./appointment");
Object.defineProperty(exports, "Appointment", { enumerable: true, get: function () { return appointment_1.Appointment; } });
// Export the contract for external service mode
exports.contracts = [bloodbase_1.BloodBase];
//# sourceMappingURL=index.js.map