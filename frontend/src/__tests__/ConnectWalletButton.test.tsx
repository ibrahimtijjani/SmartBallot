import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConnectWalletButton from '../components/common/ConnectWalletButton';
import { MockAuthProvider } from './AuthContextMock'; // Import the mock provider

describe('ConnectWalletButton', () => {
  test('renders "Connect Wallet" button when user is not logged in', () => {
    render(
      <MockAuthProvider mockValues={{ userData: null }}>
        <ConnectWalletButton />
      </MockAuthProvider>
    );

    const connectButton = screen.getByRole('button', { name: /Connect Wallet/i });
    expect(connectButton).toBeInTheDocument();
  });

  test('calls connectWallet function when "Connect Wallet" button is clicked', () => {
    const mockConnect = jest.fn();
    render(
      <MockAuthProvider mockValues={{ userData: null, connectWallet: mockConnect }}>
        <ConnectWalletButton />
      </MockAuthProvider>
    );

    const connectButton = screen.getByRole('button', { name: /Connect Wallet/i });
    fireEvent.click(connectButton);
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  test('renders user address and "Disconnect" button when user is logged in', () => {
    const mockUserData = {
      profile: {
        stxAddress: {
          testnet: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' // Example testnet address
        }
      }
    };
    render(
      <MockAuthProvider mockValues={{ userData: mockUserData }}>
        <ConnectWalletButton />
      </MockAuthProvider>
    );

    // Check for shortened address
    expect(screen.getByText(/ST1PQH...PGZGM/i)).toBeInTheDocument();

    // Check for disconnect button
    const disconnectButton = screen.getByRole('button', { name: /Disconnect/i });
    expect(disconnectButton).toBeInTheDocument();
  });

  test('calls disconnectWallet function when "Disconnect" button is clicked', () => {
    const mockDisconnect = jest.fn();
    const mockUserData = {
      profile: {
        stxAddress: {
          testnet: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
        }
      }
    };
    render(
      <MockAuthProvider mockValues={{ userData: mockUserData, disconnectWallet: mockDisconnect }}>
        <ConnectWalletButton />
      </MockAuthProvider>
    );

    const disconnectButton = screen.getByRole('button', { name: /Disconnect/i });
    fireEvent.click(disconnectButton);
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});

