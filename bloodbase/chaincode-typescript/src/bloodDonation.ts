/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {Object, Property} from 'fabric-contract-api';

@Object()
export class BloodDonation {
    @Property()
    public docType?: string;

    @Property()
    public ID: string = '';

    @Property()
    public donorID: string = '';

    @Property()
    public bloodType: string = '';

    @Property()
    public timestamp: string = '';

    @Property()
    public status: string = '';
} 