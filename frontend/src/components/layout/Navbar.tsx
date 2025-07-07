import React from 'react';
import { Link } from 'react-router-dom';
import ConnectWalletButton from '../common/ConnectWalletButton';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-blue-200 transition duration-300">
          Decentralized Voting
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-blue-200 transition duration-300">Home</Link>
          <Link to="/create" className="hover:text-blue-200 transition duration-300">Create Election</Link>
          <Link to="/analytics" className="hover:text-blue-200 transition duration-300 flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Analytics</span>
          </Link>
          <ConnectWalletButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

