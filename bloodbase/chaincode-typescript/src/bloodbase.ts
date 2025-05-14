/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { BloodDonation } from './bloodDonation';

@Info({ title: 'BloodBase', description: 'Smart contract for blood donation management' })
export class BloodBase extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const donations: BloodDonation[] = [
            {
                ID: 'donation1',
                donorID: 'donor1',
                bloodType: 'O+',
                timestamp: '2025-01-01T12:00:00Z',
                status: 'available',
            },
            {
                ID: 'donation2',
                donorID: 'donor2',
                bloodType: 'A+',
                timestamp: '2025-01-02T12:00:00Z',
                status: 'available',
            },
        ];

        for (const donation of donations) {
            donation.docType = 'donation';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(donation.ID, Buffer.from(stringify(sortKeysRecursive(donation))));
            console.info(`Donation ${donation.ID} initialized`);
        }
    }

    // CreateDonation issues a new donation to the world state with given details.
    @Transaction()
    public async CreateDonation(ctx: Context, id: string, donorID: string, bloodType: string, timestamp: string): Promise<void> {
        const exists = await this.DonationExists(ctx, id);
        if (exists) {
            throw new Error(`The donation ${id} already exists`);
        }

        const donation = {
            ID: id,
            donorID: donorID,
            bloodType: bloodType,
            timestamp: timestamp,
            status: 'available',
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(donation))));
    }

    // ReadDonation returns the donation stored in the world state with given id.
    @Transaction(false)
    public async ReadDonation(ctx: Context, id: string): Promise<string> {
        const donationJSON = await ctx.stub.getState(id); // get the donation from chaincode state
        if (donationJSON.length === 0) {
            throw new Error(`The donation ${id} does not exist`);
        }
        return donationJSON.toString();
    }

    // UpdateDonationStatus updates the status of an existing donation in the world state.
    @Transaction()
    public async UpdateDonationStatus(ctx: Context, id: string, newStatus: string): Promise<void> {
        const exists = await this.DonationExists(ctx, id);
        if (!exists) {
            throw new Error(`The donation ${id} does not exist`);
        }

        const donationString = await this.ReadDonation(ctx, id);
        const donation = JSON.parse(donationString) as BloodDonation;
        donation.status = newStatus;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(donation))));
    }

    // DeleteDonation deletes a given donation from the world state.
    @Transaction()
    public async DeleteDonation(ctx: Context, id: string): Promise<void> {
        const exists = await this.DonationExists(ctx, id);
        if (!exists) {
            throw new Error(`The donation ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // DonationExists returns true when donation with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async DonationExists(ctx: Context, id: string): Promise<boolean> {
        const donationJSON = await ctx.stub.getState(id);
        return donationJSON.length > 0;
    }

    // GetAllDonations returns all donations found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllDonations(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all donations in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue) as BloodDonation;
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
} 