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
          <ConnectWalletButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

