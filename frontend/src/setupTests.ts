// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Mock the @stacks/connect library
jest.mock('@stacks/connect', () => ({
  openContractCall: jest.fn(),
  openSTXTransfer: jest.fn(),
  showConnect: jest.fn(),
  authenticate: jest.fn(),
}));

// Mock the @stacks/transactions library
jest.mock('@stacks/transactions', () => ({
  callReadOnlyFunction: jest.fn(),
  uintCV: jest.fn((value) => ({ type: 'uint', value })),
  stringUtf8CV: jest.fn((value) => ({ type: 'string-utf8', value })),
  standardPrincipalCV: jest.fn((value) => ({ type: 'principal', value })),
  listCV: jest.fn((value) => ({ type: 'list', list: value })),
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:5173',
  },
  writable: true,
});

// Mock environment variables
process.env.VITE_CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
process.env.VITE_CONTRACT_NAME = 'voting';
process.env.VITE_NETWORK = 'testnet';
process.env.VITE_APP_TITLE = 'Decentralized Voting Platform';