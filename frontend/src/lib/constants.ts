// src/lib/constants.ts

// TODO: Replace with your actual deployed contract details
// These should ideally come from environment variables (.env)

// Example for Testnet deployment (replace with your principal)
export const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

// The name of the contract deployed on the address above
export const CONTRACT_NAME = process.env.VITE_CONTRACT_NAME || 'voting';

// Network configuration (can be 'testnet', 'mainnet', 'devnet')
export const NETWORK = process.env.VITE_NETWORK || 'testnet';

// Default Stacks API URL (can be overridden by VITE_API_BASE_URL)
export const DEFAULT_API_BASE_URL = NETWORK === 'mainnet'
  ? 'https://api.hiro.so'
  : 'https://api.testnet.hiro.so';

export const API_BASE_URL = process.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

// App Details for Wallet Connect
export const APP_NAME = process.env.VITE_APP_TITLE || 'Decentralized Voting Platform';
export const APP_ICON = window.location.origin + '/favicon.ico'; // Ensure favicon exists in public/

