import 'reflect-metadata';
import { Context, Contract } from 'fabric-contract-api';
export declare class BloodBase extends Contract {
    private readonly USER_PREFIX;
    private readonly DONATION_PREFIX;
    RegisterUser(ctx: Context, userID: string, bloodType: string, ipfsCID: string): Promise<void>;
    RecordDonation(ctx: Context, donorID: string, tokenID: string): Promise<void>;
    ReadUser(ctx: Context, userID: string): Promise<string>;
    ReadDonation(ctx: Context, donorID: string, tokenID: string): Promise<string>;
    GetDonorHistory(ctx: Context, donorID: string): Promise<string>;
    UpdateDonationStatus(ctx: Context, donorID: string, tokenID: string, newStatus: string): Promise<void>;
}
