import { Context, Contract } from 'fabric-contract-api';
export declare class BloodBase extends Contract {
    InitLedger(ctx: Context): Promise<void>;
    CreateDonation(ctx: Context, id: string, donorID: string, bloodType: string, timestamp: string): Promise<void>;
    ReadDonation(ctx: Context, id: string): Promise<string>;
    UpdateDonationStatus(ctx: Context, id: string, newStatus: string): Promise<void>;
    DeleteDonation(ctx: Context, id: string): Promise<void>;
    DonationExists(ctx: Context, id: string): Promise<boolean>;
    GetAllDonations(ctx: Context): Promise<string>;
}
//# sourceMappingURL=bloodbase.d.ts.map