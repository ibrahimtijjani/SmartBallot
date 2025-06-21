import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ConnectWalletButton: React.FC = () => {
  const { connectWallet, disconnectWallet, userData } = useAuth();

  const handleConnect = () => {
    connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const getShortenedAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div>
      {userData ? (
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium">
              {getShortenedAddress(userData.profile?.stxAddress?.testnet ?? userData.profile?.stxAddress?.mainnet ?? '')}
            </span>
          </div>
          <button
            onClick={handleDisconnect}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-3 sm:py-2 sm:px-4 rounded transition duration-300 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Disconnect</span>
            <span className="sm:hidden">✕</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-1.5 px-3 sm:py-2 sm:px-4 rounded transition duration-300 text-xs sm:text-sm flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="hidden sm:inline">Connect Wallet</span>
          <span className="sm:hidden">Connect</span>
        </button>
      )}
    </div>
  );
};

export default ConnectWalletButton;

