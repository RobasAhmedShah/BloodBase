import 'reflect-metadata';
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { v4 as uuidv4 } from 'uuid';

interface User {
    userID: string;
    bloodType: string;
    ipfsCID: string;
    timestamp: string;
    isActive: boolean;
}

interface Donation {
    donorID: string;
    tokenID: string;
    timestamp: string;
    status: string;
    expiryDate: string;
}

@Info({ title: 'BloodBase', description: 'Smart contract for blood donation management' })
export class BloodBase extends Contract {
    private readonly USER_PREFIX = 'USER:';
    private readonly DONATION_PREFIX = 'DONATION:';

    @Transaction()
    public async RegisterUser(ctx: Context, userID: string, bloodType: string, ipfsCID: string): Promise<void> {
        // Check if user already exists
        const userKey = this.USER_PREFIX + userID;
        const existingUser = await ctx.stub.getState(userKey);
        if (existingUser && existingUser.length > 0) {
            throw new Error(`User ${userID} already exists`);
        }

        // Create new user
        const user: User = {
            userID,
            bloodType,
            ipfsCID,
            timestamp: new Date().toISOString(),
            isActive: true
        };

        // Store user data
        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));

        // Emit event
        ctx.stub.setEvent('UserRegistered', Buffer.from(JSON.stringify({
            userID,
            timestamp: user.timestamp
        })));
    }

    @Transaction()
    public async RecordDonation(ctx: Context, donorID: string, tokenID: string): Promise<void> {
        // Verify donor exists
        const userKey = this.USER_PREFIX + donorID;
        const userBytes = await ctx.stub.getState(userKey);
        if (!userBytes || userBytes.length === 0) {
            throw new Error(`Donor ${donorID} does not exist`);
        }

        // Calculate expiry date (35 days from now)
        const timestamp = new Date();
        const expiryDate = new Date(timestamp);
        expiryDate.setDate(expiryDate.getDate() + 35);

        // Create donation record
        const donation: Donation = {
            donorID,
            tokenID,
            timestamp: timestamp.toISOString(),
            status: 'COLLECTED',
            expiryDate: expiryDate.toISOString()
        };

        // Store donation data using composite key
        const donationKey = this.DONATION_PREFIX + donorID + ':' + tokenID;
        await ctx.stub.putState(donationKey, Buffer.from(JSON.stringify(donation)));

        // Emit event
        ctx.stub.setEvent('DonationRecorded', Buffer.from(JSON.stringify({
            donorID,
            tokenID,
            timestamp: donation.timestamp
        })));
    }

    @Transaction(false)
    @Returns('string')
    public async ReadUser(ctx: Context, userID: string): Promise<string> {
        const userKey = this.USER_PREFIX + userID;
        const userBytes = await ctx.stub.getState(userKey);
        if (!userBytes || userBytes.length === 0) {
            throw new Error(`User ${userID} does not exist`);
        }
        return userBytes.toString();
    }

    @Transaction(false)
    @Returns('string')
    public async ReadDonation(ctx: Context, donorID: string, tokenID: string): Promise<string> {
        const donationKey = this.DONATION_PREFIX + donorID + ':' + tokenID;
        const donationBytes = await ctx.stub.getState(donationKey);
        if (!donationBytes || donationBytes.length === 0) {
            throw new Error(`Donation record not found for donor ${donorID} and token ${tokenID}`);
        }
        return donationBytes.toString();
    }

    @Transaction(false)
    @Returns('string')
    public async GetDonorHistory(ctx: Context, donorID: string): Promise<string> {
        const iterator = await ctx.stub.getStateByPartialCompositeKey(this.DONATION_PREFIX, [donorID]);
        const donations = [];

        while (true) {
            const result = await iterator.next();
            if (result.value) {
                const donation = JSON.parse(result.value.value.toString());
                donations.push(donation);
            }
            if (result.done) {
                await iterator.close();
                break;
            }
        }

        return JSON.stringify(donations);
    }

    @Transaction()
    public async UpdateDonationStatus(ctx: Context, donorID: string, tokenID: string, newStatus: string): Promise<void> {
        const donationKey = this.DONATION_PREFIX + donorID + ':' + tokenID;
        const donationBytes = await ctx.stub.getState(donationKey);
        
        if (!donationBytes || donationBytes.length === 0) {
            throw new Error(`Donation record not found for donor ${donorID} and token ${tokenID}`);
        }

        const donation: Donation = JSON.parse(donationBytes.toString());
        donation.status = newStatus;

        await ctx.stub.putState(donationKey, Buffer.from(JSON.stringify(donation)));

        // Emit event
        ctx.stub.setEvent('DonationStatusUpdated', Buffer.from(JSON.stringify({
            donorID,
            tokenID,
            newStatus,
            timestamp: new Date().toISOString()
        })));
    }
} 