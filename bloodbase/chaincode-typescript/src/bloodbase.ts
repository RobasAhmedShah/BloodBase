/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';

@Info({ title: 'BloodBase', description: 'Smart contract for blood donation management' })
export class BloodBase extends Contract {

    // Initialize the ledger with some donations
    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
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
            await ctx.stub.putState(donation.ID, Buffer.from(stringify(sortKeysRecursive(donation))));
            console.info(`Donation ${donation.ID} initialized`);
        }
    }

    // CreateDonation issues a new donation to the world state with given details.
    @Transaction()
    public async CreateDonation(ctx: Context, id: string, donorID: string, bloodType: string, timestamp: string): Promise<void> {
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
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(donation))));
        console.info(`Donation ${id} has been created`);
    }


    // ReadDonation returns the donation stored in the world state with given id.
    @Transaction(false)
    public async ReadDonation(ctx: Context, id: string): Promise<string> {
        console.info(`Reading donation ${id}`);
        
        const donationJSON = await ctx.stub.getState(id);
        if (!donationJSON || donationJSON.length === 0) {
            throw new Error(`The donation ${id} does not exist`);
        }
        
        console.info(`Donation ${id} found`);
        return donationJSON.toString();
    }

    // UpdateDonationStatus updates the status of an existing donation in the world state.
    @Transaction()
    public async UpdateDonationStatus(ctx: Context, id: string, newStatus: string): Promise<void> {
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
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(donation))));
        console.info(`Donation ${id} status updated to ${newStatus}`);
    }

    // DeleteDonation deletes a given donation from the world state.
    @Transaction()
    public async DeleteDonation(ctx: Context, id: string): Promise<void> {
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
    @Transaction(false)
    @Returns('boolean')
    public async DonationExists(ctx: Context, id: string): Promise<boolean> {
        const donationJSON = await ctx.stub.getState(id);
        return donationJSON && donationJSON.length > 0;
    }

    // GetAllDonations returns all donations found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllDonations(ctx: Context): Promise<string> {
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
            } catch (err) {
                console.error(`Error parsing: ${err}`);
            }
            result = await iterator.next();
        }
        
        // Close the iterator
        await iterator.close();
        
        console.info(`Found ${allResults.length} donations`);
        return JSON.stringify(allResults);
    }
} 