import * as grpc from '@grpc/grpc-js';
import { Contract, Identity, Signer } from '@hyperledger/fabric-gateway';
/**
 * Load an identity from the wallet directory - supports both old and new wallet formats
 */
export declare const loadIdentity: (identityLabel: string) => Promise<Identity>;
/**
 * Load a private key and create a signer - supports both old and new wallet formats
 */
export declare const loadSigner: (identityLabel: string) => Promise<Signer>;
/**
 * Create a gRPC client connection to the Fabric network
 */
export declare const createGrpcConnection: () => grpc.Client;
/**
 * Load connection profile from filesystem
 */
export declare const loadConnectionProfile: () => any;
/**
 * Initialize the connection to the Fabric network and return a contract
 */
export declare const initFabric: () => Promise<Contract>;
/**
 * Evaluate a transaction (query)
 */
export declare const evaluateTransaction: (contract: Contract, transactionName: string, ...transactionArgs: string[]) => Promise<Uint8Array>;
/**
 * Submit a transaction (update)
 */
export declare const submitTransaction: (contract: Contract, transactionName: string, ...transactionArgs: string[]) => Promise<Uint8Array>;
