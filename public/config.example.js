/**
 * Frontend Configuration for ConfidentialFlightBooking
 *
 * Copy this file to config.js and update with your deployed contract addresses
 */

// Smart Contract Addresses (Sepolia Testnet)
export const CONTRACT_ADDRESS = '0x604923E8D9d7938DE98Dd5aE193d6eea0336206A';
export const PAUSER_SET_ADDRESS = '0x89101063912C3e471dA0ead7142BD430f423de2D';

// Network Configuration
export const NETWORK = 'sepolia';
export const CHAIN_ID = 11155111;

// RPC Configuration
export const RPC_URL = 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID';

// Zama FHE Gateway
export const GATEWAY_URL = 'https://gateway.zama.ai';

// Contract ABI Paths (relative to public folder)
export const CONTRACT_ABI_PATH = '/abis/ConfidentialFlightBooking.json';
export const PAUSER_SET_ABI_PATH = '/abis/PauserSet.json';

// Etherscan
export const ETHERSCAN_BASE_URL = 'https://sepolia.etherscan.io';
export const CONTRACT_ETHERSCAN_URL = `${ETHERSCAN_BASE_URL}/address/${CONTRACT_ADDRESS}`;
export const PAUSER_SET_ETHERSCAN_URL = `${ETHERSCAN_BASE_URL}/address/${PAUSER_SET_ADDRESS}`;

// Application Settings
export const APP_NAME = 'PrivateAir';
export const APP_DESCRIPTION = 'Confidential Flight Booking with FHE';

// Feature Flags
export const FEATURES = {
  enableBooking: true,
  enableCancellation: true,
  enableLoyaltyPoints: true,
  enableVIPStatus: true,
  enableInsurance: true
};

// UI Settings
export const UI_SETTINGS = {
  showTransactionDetails: true,
  showEncryptedData: false, // Don't show encrypted values to users
  autoRefresh: true,
  refreshInterval: 30000 // 30 seconds
};
