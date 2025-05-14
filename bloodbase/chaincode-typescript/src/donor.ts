/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Donor {
    @Property()
    public docType?: string;

    @Property()
    public ID: string = '';

    @Property()
    public name: string = '';

    @Property()
    public cnic: string = '';

    @Property()
    public bloodType: string = '';

    @Property()
    public phone: string = '';

    @Property()
    public email: string = '';

    @Property()
    public address: string = '';

    @Property()
    public dateOfBirth: string = '';

    @Property()
    public lastDonationDate: string = '';

    @Property()
    public medicalHistory: string = '';

    @Property()
    public eligibilityStatus: string = 'pending';

    @Property()
    public registrationDate: string = '';

    @Property()
    public totalDonations: string = '0';
} 