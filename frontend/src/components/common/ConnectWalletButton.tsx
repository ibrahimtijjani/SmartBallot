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
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div>
      {userData ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {getShortenedAddress(userData.profile?.stxAddress?.testnet ?? userData.profile?.stxAddress?.mainnet ?? '')}
          </span>
          <button
            onClick={handleDisconnect}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-300 text-sm"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition duration-300 text-sm"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default ConnectWalletButton;

