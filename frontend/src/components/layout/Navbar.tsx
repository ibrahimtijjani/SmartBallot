import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ConnectWalletButton from '../common/ConnectWalletButton';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl md:text-2xl font-bold hover:text-blue-200 transition duration-300 flex-shrink-0"
          >
            <span className="hidden sm:inline">Decentralized Voting</span>
            <span className="sm:hidden">DV Platform</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="hover:text-blue-200 transition duration-300 font-medium"
            >
              Home
            </Link>
            <Link 
              to="/create" 
              className="hover:text-blue-200 transition duration-300 font-medium"
            >
              Create Election
            </Link>
            <ConnectWalletButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            <ConnectWalletButton />
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md hover:text-blue-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg 
                  className="h-6 w-6" 
                  stroke="currentColor" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              ) : (
                <svg 
                  className="h-6 w-6" 
                  stroke="currentColor" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-blue-500">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-base font-medium hover:text-blue-200 hover:bg-blue-700 rounded-md transition duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/create"
                className="block px-3 py-2 text-base font-medium hover:text-blue-200 hover:bg-blue-700 rounded-md transition duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Create Election
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

