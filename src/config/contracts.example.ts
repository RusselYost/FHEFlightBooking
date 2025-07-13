/**
 * TypeScript Configuration for ConfidentialFlightBooking
 *
 * Copy this file to contracts.ts and update with your deployed contract addresses
 */

// Contract Addresses
export const CONTRACTS = {
  ConfidentialFlightBooking: '0x604923E8D9d7938DE98Dd5aE193d6eea0336206A',
  PauserSet: '0x89101063912C3e471dA0ead7142BD430f423de2D'
} as const;

// Network Configuration
export const NETWORK_CONFIG = {
  name: 'sepolia',
  chainId: 11155111,
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
  blockExplorer: 'https://sepolia.etherscan.io'
} as const;

// FHE Configuration
export const FHE_CONFIG = {
  gatewayUrl: 'https://gateway.zama.ai',
  version: '0.9.0-1'
} as const;

// Zama FHE Contract Addresses (Sepolia)
export const ZAMA_CONTRACTS = {
  ACLAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
  FHEVMExecutorAddress: '0x848B0066793BcC60346Da1F49049357399B8D595',
  KMSVerifierAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
  InputVerifierAddress: '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4'
} as const;

// Contract URLs
export const CONTRACT_URLS = {
  main: `${NETWORK_CONFIG.blockExplorer}/address/${CONTRACTS.ConfidentialFlightBooking}`,
  pauserSet: `${NETWORK_CONFIG.blockExplorer}/address/${CONTRACTS.PauserSet}`
} as const;

// Application Configuration
export interface AppConfig {
  contractAddress: string;
  pauserSetAddress: string;
  networkName: string;
  chainId: number;
  gatewayUrl: string;
}

export const APP_CONFIG: AppConfig = {
  contractAddress: CONTRACTS.ConfidentialFlightBooking,
  pauserSetAddress: CONTRACTS.PauserSet,
  networkName: NETWORK_CONFIG.name,
  chainId: NETWORK_CONFIG.chainId,
  gatewayUrl: FHE_CONFIG.gatewayUrl
};

// Feature Flags
export const FEATURES = {
  enableBooking: true,
  enableCancellation: true,
  enableLoyaltyPoints: true,
  enableVIPStatus: true,
  enableInsurance: true,
  enableDecryption: false // Requires DecryptionOracle integration
} as const;

// Export types
export type ContractName = keyof typeof CONTRACTS;
export type NetworkName = typeof NETWORK_CONFIG.name;
