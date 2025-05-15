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
        // Initialize some donors as well
        const donors = [
            {
                ID: 'donor1',
                name: 'John Doe',
                cnic: '12345-1234567-1',
                bloodType: 'O+',
                phone: '+923001234567',
                email: 'john@example.com',
                address: '123 Main St, City',
                dateOfBirth: '1985-05-15',
                lastDonationDate: '2025-01-01',
                medicalHistory: 'None',
                eligibilityStatus: 'eligible',
                registrationDate: '2024-01-01',
                totalDonations: '1',
                docType: 'donor'
            },
            {
                ID: 'donor2',
                name: 'Jane Smith',
                cnic: '12345-7654321-2',
                bloodType: 'A+',
                phone: '+923007654321',
                email: 'jane@example.com',
                address: '456 Oak St, City',
                dateOfBirth: '1990-10-20',
                lastDonationDate: '2025-01-02',
                medicalHistory: 'None',
                eligibilityStatus: 'eligible',
                registrationDate: '2024-01-15',
                totalDonations: '1',
                docType: 'donor'
            }
        ];
        for (const donor of donors) {
            await ctx.stub.putState(donor.ID, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(donor))));
            console.info(`Donor ${donor.ID} initialized`);
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
    // DONOR MANAGEMENT FUNCTIONS
    // CreateDonor registers a new donor in the world state
    async CreateDonor(ctx, id, name, cnic, bloodType, phone, email, address, dateOfBirth, registrationDate) {
        console.info(`Creating donor ${id}: ${name}`);
        // Check if the donor already exists
        const exists = await this.DonorExists(ctx, id);
        if (exists) {
            throw new Error(`The donor ${id} already exists`);
        }
        // Create donor object
        const donor = {
            ID: id,
            name,
            cnic,
            bloodType,
            phone,
            email,
            address,
            dateOfBirth,
            lastDonationDate: '',
            medicalHistory: 'None',
            eligibilityStatus: 'pending',
            registrationDate: registrationDate,
            totalDonations: '0',
            docType: 'donor'
        };
        await ctx.stub.putState(id, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(donor))));
        console.info(`Donor ${id} has been created`);
    }
    // ReadDonor returns the donor stored in the world state with given id
    async ReadDonor(ctx, id) {
        console.info(`Reading donor ${id}`);
        const donorJSON = await ctx.stub.getState(id);
        if (!donorJSON || donorJSON.length === 0) {
            throw new Error(`The donor ${id} does not exist`);
        }
        console.info(`Donor ${id} found`);
        return donorJSON.toString();
    }
    // UpdateDonor updates an existing donor's details in the world state
    async UpdateDonor(ctx, id, name, cnic, bloodType, phone, email, address, dateOfBirth, medicalHistory) {
        console.info(`Updating donor ${id}`);
        // Check if donor exists
        const exists = await this.DonorExists(ctx, id);
        if (!exists) {
            throw new Error(`The donor ${id} does not exist`);
        }
        // Get current state
        const donorString = await this.ReadDonor(ctx, id);
        const donor = JSON.parse(donorString);
        // Update donor details
        donor.name = name;
        donor.cnic = cnic;
        donor.bloodType = bloodType;
        donor.phone = phone;
        donor.email = email;
        donor.address = address;
        donor.dateOfBirth = dateOfBirth;
        donor.medicalHistory = medicalHistory;
        await ctx.stub.putState(id, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(donor))));
        console.info(`Donor ${id} has been updated`);
    }
    // UpdateDonorEligibility updates a donor's eligibility status
    async UpdateDonorEligibility(ctx, id, eligibilityStatus) {
        console.info(`Updating donor ${id} eligibility to ${eligibilityStatus}`);
        // Check if donor exists
        const exists = await this.DonorExists(ctx, id);
        if (!exists) {
            throw new Error(`The donor ${id} does not exist`);
        }
        // Get current state
        const donorString = await this.ReadDonor(ctx, id);
        const donor = JSON.parse(donorString);
        // Update eligibility
        donor.eligibilityStatus = eligibilityStatus;
        await ctx.stub.putState(id, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(donor))));
        console.info(`Donor ${id} eligibility updated to ${eligibilityStatus}`);
    }
    // UpdateDonorLastDonation updates a donor's last donation date and increments total donations
    async UpdateDonorLastDonation(ctx, id, donationDate) {
        console.info(`Updating donor ${id} last donation to ${donationDate}`);
        // Check if donor exists
        const exists = await this.DonorExists(ctx, id);
        if (!exists) {
            throw new Error(`The donor ${id} does not exist`);
        }
        // Get current state
        const donorString = await this.ReadDonor(ctx, id);
        const donor = JSON.parse(donorString);
        // Update last donation date
        donor.lastDonationDate = donationDate;
        // Increment total donations
        donor.totalDonations = (parseInt(donor.totalDonations) + 1).toString();
        await ctx.stub.putState(id, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(donor))));
        console.info(`Donor ${id} last donation updated to ${donationDate}`);
    }
    // DeleteDonor deletes a given donor from the world state
    async DeleteDonor(ctx, id) {
        console.info(`Deleting donor ${id}`);
        // Check if donor exists
        const exists = await this.DonorExists(ctx, id);
        if (!exists) {
            throw new Error(`The donor ${id} does not exist`);
        }
        // Delete state directly by ID
        await ctx.stub.deleteState(id);
        console.info(`Donor ${id} has been deleted`);
    }
    // DonorExists returns true when donor with given ID exists in world state
    async DonorExists(ctx, id) {
        const donorJSON = await ctx.stub.getState(id);
        return donorJSON && donorJSON.length > 0;
    }
    // GetAllDonors returns all donors found in the world state
    async GetAllDonors(ctx) {
        console.info('Getting all donors');
        const allResults = [];
        // Use standard range query like in the reference code
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Only include donor objects
                if (record.docType === 'donor') {
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
        console.info(`Found ${allResults.length} donors`);
        return JSON.stringify(allResults);
    }
    // GetDonationsByDonor returns all donations made by a specific donor
    async GetDonationsByDonor(ctx, donorID) {
        console.info(`Getting donations for donor ${donorID}`);
        // Check if donor exists
        const donorExists = await this.DonorExists(ctx, donorID);
        if (!donorExists) {
            throw new Error(`The donor ${donorID} does not exist`);
        }
        const allResults = [];
        // Use standard range query
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Only include donation objects for the specified donor
                if (record.docType === 'donation' && record.donorID === donorID) {
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
        console.info(`Found ${allResults.length} donations for donor ${donorID}`);
        return JSON.stringify(allResults);
    }
    // GetEligibleDonors returns all donors who are eligible to donate
    async GetEligibleDonors(ctx) {
        console.info('Getting all eligible donors');
        const allResults = [];
        // Use standard range query
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Only include eligible donor objects
                if (record.docType === 'donor' && record.eligibilityStatus === 'eligible') {
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
        console.info(`Found ${allResults.length} eligible donors`);
        return JSON.stringify(allResults);
    }
    // APPOINTMENT MANAGEMENT FUNCTIONS
    // CreateAppointment issues a new appointment to the world state
    async CreateAppointment(ctx, id, userID, userType, bloodBankID, appointmentDate, appointmentTime, purpose, notes) {
        console.info(`Creating appointment ${id} for ${userType} ${userID}`);
        // Check if the appointment already exists
        const exists = await this.AppointmentExists(ctx, id);
        if (exists) {
            throw new Error(`The appointment ${id} already exists`);
        }
        // If userType is donor, check if donor exists
        if (userType === 'donor') {
            const donorExists = await this.DonorExists(ctx, userID);
            if (!donorExists) {
                throw new Error(`The donor ${userID} does not exist`);
            }
        }
        // Generate a unique token for the appointment
        const tokenID = `token_${id}`;
        // Create appointment object
        const appointment = {
            ID: id,
            userID,
            userType,
            bloodBankID,
            appointmentDate,
            appointmentTime,
            purpose,
            status: 'scheduled',
            tokenID,
            notes,
            docType: 'appointment'
        };
        await ctx.stub.putState(id, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(appointment))));
        console.info(`Appointment ${id} has been created`);
    }
    // ReadAppointment returns the appointment stored in the world state with given id
    async ReadAppointment(ctx, id) {
        console.info(`Reading appointment ${id}`);
        const appointmentJSON = await ctx.stub.getState(id);
        if (!appointmentJSON || appointmentJSON.length === 0) {
            throw new Error(`The appointment ${id} does not exist`);
        }
        console.info(`Appointment ${id} found`);
        return appointmentJSON.toString();
    }
    // UpdateAppointmentStatus updates the status of an appointment
    async UpdateAppointmentStatus(ctx, id, newStatus) {
        console.info(`Updating appointment ${id} status to ${newStatus}`);
        // Check if appointment exists
        const exists = await this.AppointmentExists(ctx, id);
        if (!exists) {
            throw new Error(`The appointment ${id} does not exist`);
        }
        // Validate status value
        const validStatuses = ['scheduled', 'completed', 'cancelled'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Invalid status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`);
        }
        // Get current state
        const appointmentString = await this.ReadAppointment(ctx, id);
        const appointment = JSON.parse(appointmentString);
        // Update status
        appointment.status = newStatus;
        // If appointment is completed and purpose is donation, update the donor's last donation date
        if (newStatus === 'completed' && appointment.purpose === 'donation' && appointment.userType === 'donor') {
            const donorExists = await this.DonorExists(ctx, appointment.userID);
            if (donorExists) {
                await this.UpdateDonorLastDonation(ctx, appointment.userID, appointment.appointmentDate);
            }
        }
        await ctx.stub.putState(id, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(appointment))));
        console.info(`Appointment ${id} status updated to ${newStatus}`);
    }
    // RescheduleAppointment updates the date and time of an appointment
    async RescheduleAppointment(ctx, id, newDate, newTime) {
        console.info(`Rescheduling appointment ${id} to ${newDate} at ${newTime}`);
        // Check if appointment exists
        const exists = await this.AppointmentExists(ctx, id);
        if (!exists) {
            throw new Error(`The appointment ${id} does not exist`);
        }
        // Get current state
        const appointmentString = await this.ReadAppointment(ctx, id);
        const appointment = JSON.parse(appointmentString);
        // Update appointment date and time
        appointment.appointmentDate = newDate;
        appointment.appointmentTime = newTime;
        // Ensure status is scheduled
        appointment.status = 'scheduled';
        await ctx.stub.putState(id, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(appointment))));
        console.info(`Appointment ${id} rescheduled to ${newDate} at ${newTime}`);
    }
    // DeleteAppointment deletes a given appointment from the world state
    async DeleteAppointment(ctx, id) {
        console.info(`Deleting appointment ${id}`);
        // Check if appointment exists
        const exists = await this.AppointmentExists(ctx, id);
        if (!exists) {
            throw new Error(`The appointment ${id} does not exist`);
        }
        // Delete state directly by ID
        await ctx.stub.deleteState(id);
        console.info(`Appointment ${id} has been deleted`);
    }
    // AppointmentExists returns true when appointment with given ID exists in world state
    async AppointmentExists(ctx, id) {
        const appointmentJSON = await ctx.stub.getState(id);
        return appointmentJSON && appointmentJSON.length > 0;
    }
    // GetAllAppointments returns all appointments found in the world state
    async GetAllAppointments(ctx) {
        console.info('Getting all appointments');
        const allResults = [];
        // Use standard range query
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Only include appointment objects
                if (record.docType === 'appointment') {
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
        console.info(`Found ${allResults.length} appointments`);
        return JSON.stringify(allResults);
    }
    // GetAppointmentsByUser returns all appointments for a specific user
    async GetAppointmentsByUser(ctx, userID, userType) {
        console.info(`Getting appointments for ${userType} ${userID}`);
        const allResults = [];
        // Use standard range query
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Only include appointment objects for the specified user
                if (record.docType === 'appointment' && record.userID === userID && record.userType === userType) {
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
        console.info(`Found ${allResults.length} appointments for ${userType} ${userID}`);
        return JSON.stringify(allResults);
    }
    // GetAppointmentsByDate returns all appointments for a specific date
    async GetAppointmentsByDate(ctx, date) {
        console.info(`Getting appointments for date ${date}`);
        const allResults = [];
        // Use standard range query
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Only include appointment objects for the specified date
                if (record.docType === 'appointment' && record.appointmentDate === date) {
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
        console.info(`Found ${allResults.length} appointments for date ${date}`);
        return JSON.stringify(allResults);
    }
    // GetAppointmentsByStatus returns all appointments with a specific status
    async GetAppointmentsByStatus(ctx, status) {
        console.info(`Getting appointments with status ${status}`);
        // Validate status value
        const validStatuses = ['scheduled', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
        }
        const allResults = [];
        // Use standard range query
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Only include appointment objects with the specified status
                if (record.docType === 'appointment' && record.status === status) {
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
        console.info(`Found ${allResults.length} appointments with status ${status}`);
        return JSON.stringify(allResults);
    }
    // PATIENT MANAGEMENT FUNCTIONS
    // CreatePatient registers a new patient in the world state
    async CreatePatient(ctx, id, name, cnic, bloodType, phone, email, address, dateOfBirth, medicalHistory, doctorPrescription, registrationDate) {
        console.info(`Creating patient ${id}: ${name}`);
        // Check if the patient already exists
        const exists = await this.PatientExists(ctx, id);
        if (exists) {
            throw new Error(`The patient ${id} already exists`);
        }
        // Create patient object
        const patient = {
            ID: id,
            name,
            cnic,
            bloodType,
            phone,
            email,
            address,
            dateOfBirth,
            medicalHistory,
            doctorPrescription,
            eligibilityStatus: 'pending',
            registrationDate: registrationDate,
            totalTransfusions: '0',
            docType: 'patient'
        };
        await ctx.stub.putState(id, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(patient))));
        console.info(`Patient ${id} has been created`);
    }
    // ReadPatient returns the patient stored in the world state with given id
    async ReadPatient(ctx, id) {
        console.info(`Reading patient ${id}`);
        const patientJSON = await ctx.stub.getState(id);
        if (!patientJSON || patientJSON.length === 0) {
            throw new Error(`The patient ${id} does not exist`);
        }
        console.info(`Patient ${id} found`);
        return patientJSON.toString();
    }
    // UpdatePatient updates an existing patient's details in the world state
    async UpdatePatient(ctx, id, name, cnic, bloodType, phone, email, address, dateOfBirth, medicalHistory, doctorPrescription) {
        console.info(`Updating patient ${id}`);
        // Check if patient exists
        const exists = await this.PatientExists(ctx, id);
        if (!exists) {
            throw new Error(`The patient ${id} does not exist`);
        }
        // Get current state
        const patientString = await this.ReadPatient(ctx, id);
        const patient = JSON.parse(patientString);
        // Update patient details
        patient.name = name;
        patient.cnic = cnic;
        patient.bloodType = bloodType;
        patient.phone = phone;
        patient.email = email;
        patient.address = address;
        patient.dateOfBirth = dateOfBirth;
        patient.medicalHistory = medicalHistory;
        patient.doctorPrescription = doctorPrescription;
        await ctx.stub.putState(id, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(patient))));
        console.info(`Patient ${id} has been updated`);
    }
    // UpdatePatientEligibility updates a patient's eligibility status
    async UpdatePatientEligibility(ctx, id, eligibilityStatus) {
        console.info(`Updating patient ${id} eligibility to ${eligibilityStatus}`);
        // Check if patient exists
        const exists = await this.PatientExists(ctx, id);
        if (!exists) {
            throw new Error(`The patient ${id} does not exist`);
        }
        // Get current state
        const patientString = await this.ReadPatient(ctx, id);
        const patient = JSON.parse(patientString);
        // Update eligibility
        patient.eligibilityStatus = eligibilityStatus;
        await ctx.stub.putState(id, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(patient))));
        console.info(`Patient ${id} eligibility updated to ${eligibilityStatus}`);
    }
    // UpdatePatientTransfusion records a new transfusion for a patient
    async UpdatePatientTransfusion(ctx, id, donationID) {
        console.info(`Recording transfusion for patient ${id} using donation ${donationID}`);
        // Check if patient exists
        const exists = await this.PatientExists(ctx, id);
        if (!exists) {
            throw new Error(`The patient ${id} does not exist`);
        }
        // Check if donation exists
        const donationExists = await this.DonationExists(ctx, donationID);
        if (!donationExists) {
            throw new Error(`The donation ${donationID} does not exist`);
        }
        // Get current patient state
        const patientString = await this.ReadPatient(ctx, id);
        const patient = JSON.parse(patientString);
        // Get current donation state
        const donationString = await this.ReadDonation(ctx, donationID);
        const donation = JSON.parse(donationString);
        // Check if donation is available
        if (donation.status !== 'available') {
            throw new Error(`The donation ${donationID} is not available (current status: ${donation.status})`);
        }
        // Update donation status to transfused
        await this.UpdateDonationStatus(ctx, donationID, 'transfused');
        // Increment total transfusions for patient
        patient.totalTransfusions = (parseInt(patient.totalTransfusions) + 1).toString();
        await ctx.stub.putState(id, Buffer.from((0, json_stringify_deterministic_1.default)((0, sort_keys_recursive_1.default)(patient))));
        console.info(`Transfusion recorded for patient ${id} using donation ${donationID}`);
    }
    // DeletePatient deletes a given patient from the world state
    async DeletePatient(ctx, id) {
        console.info(`Deleting patient ${id}`);
        // Check if patient exists
        const exists = await this.PatientExists(ctx, id);
        if (!exists) {
            throw new Error(`The patient ${id} does not exist`);
        }
        // Delete state directly by ID
        await ctx.stub.deleteState(id);
        console.info(`Patient ${id} has been deleted`);
    }
    // PatientExists returns true when patient with given ID exists in world state
    async PatientExists(ctx, id) {
        const patientJSON = await ctx.stub.getState(id);
        return patientJSON && patientJSON.length > 0;
    }
    // GetAllPatients returns all patients found in the world state
    async GetAllPatients(ctx) {
        console.info('Getting all patients');
        const allResults = [];
        // Use standard range query like in the reference code
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Only include patient objects
                if (record.docType === 'patient') {
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
        console.info(`Found ${allResults.length} patients`);
        return JSON.stringify(allResults);
    }
    // GetPatientsByBloodType returns patients with a specific blood type
    async GetPatientsByBloodType(ctx, bloodType) {
        console.info(`Getting patients with blood type ${bloodType}`);
        const allResults = [];
        // Use standard range query
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Only include patient objects with the specified blood type
                if (record.docType === 'patient' && record.bloodType === bloodType) {
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
        console.info(`Found ${allResults.length} patients with blood type ${bloodType}`);
        return JSON.stringify(allResults);
    }
    // GetCompatibleBloodDonations returns available donations compatible with a patient's blood type
    async GetCompatibleBloodDonations(ctx, patientID) {
        console.info(`Finding compatible blood donations for patient ${patientID}`);
        // Check if patient exists
        const exists = await this.PatientExists(ctx, patientID);
        if (!exists) {
            throw new Error(`The patient ${patientID} does not exist`);
        }
        // Get patient details to determine blood type
        const patientString = await this.ReadPatient(ctx, patientID);
        const patient = JSON.parse(patientString);
        const patientBloodType = patient.bloodType;
        // Define blood type compatibility map
        const compatibilityMap = {
            'O-': ['O-'],
            'O+': ['O-', 'O+'],
            'A-': ['O-', 'A-'],
            'A+': ['O-', 'O+', 'A-', 'A+'],
            'B-': ['O-', 'B-'],
            'B+': ['O-', 'O+', 'B-', 'B+'],
            'AB-': ['O-', 'A-', 'B-', 'AB-'],
            'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
        };
        // Get compatible blood types for this patient
        const compatibleTypes = compatibilityMap[patientBloodType] || [];
        if (compatibleTypes.length === 0) {
            throw new Error(`Invalid or unsupported blood type: ${patientBloodType}`);
        }
        const allResults = [];
        // Use standard range query
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Only include available donation objects with compatible blood types
                if (record.docType === 'donation' &&
                    record.status === 'available' &&
                    compatibleTypes.includes(record.bloodType)) {
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
        console.info(`Found ${allResults.length} compatible donations for patient ${patientID}`);
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
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "CreateDonor", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "ReadDonor", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "UpdateDonor", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "UpdateDonorEligibility", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "UpdateDonorLastDonation", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "DeleteDonor", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('boolean'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "DonorExists", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "GetAllDonors", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "GetDonationsByDonor", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "GetEligibleDonors", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "CreateAppointment", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "ReadAppointment", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "UpdateAppointmentStatus", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "RescheduleAppointment", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "DeleteAppointment", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('boolean'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "AppointmentExists", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "GetAllAppointments", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "GetAppointmentsByUser", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "GetAppointmentsByDate", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "GetAppointmentsByStatus", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "CreatePatient", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "ReadPatient", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "UpdatePatient", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "UpdatePatientEligibility", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "UpdatePatientTransfusion", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "DeletePatient", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('boolean'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "PatientExists", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "GetAllPatients", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "GetPatientsByBloodType", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BloodBase.prototype, "GetCompatibleBloodDonations", null);
exports.BloodBase = BloodBase = __decorate([
    (0, fabric_contract_api_1.Info)({ title: 'BloodBase', description: 'Smart contract for blood donation management' })
], BloodBase);
//# sourceMappingURL=bloodbase.js.map