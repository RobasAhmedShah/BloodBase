/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Appointment {
    @Property()
    public docType?: string;

    @Property()
    public ID: string = '';

    @Property()
    public userID: string = ''; // ID of the donor or patient

    @Property()
    public userType: string = ''; // 'donor' or 'patient'

    @Property()
    public bloodBankID: string = '';

    @Property()
    public appointmentDate: string = '';

    @Property()
    public appointmentTime: string = '';

    @Property()
    public purpose: string = ''; // 'donation' or 'transfusion'

    @Property()
    public status: string = 'scheduled'; // scheduled, completed, cancelled

    @Property()
    public tokenID: string = '';

    @Property()
    public notes: string = '';
} 