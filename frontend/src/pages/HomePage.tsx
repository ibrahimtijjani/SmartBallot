import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  // TODO: Fetch and display list of elections from the smart contract
  return (
    <div className="space-y-8">      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Decentralized Voting Platform
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Participate in transparent, secure, and decentralized elections powered by blockchain technology.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/create"
            className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition duration-300"
          >
            Create Election
          </Link>
          <button className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700 transition duration-300">
            Learn More
          </button>
        </div>
      </div>

      {/* Elections Section */}
      <div>        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
            Available Elections
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-dark-800 text-gray-900 dark:text-white">
              <option>All Elections</option>
              <option>Active</option>
              <option>Upcoming</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        {/* Election Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Example Election Cards */}          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-dark-800 rounded-lg shadow-md hover:shadow-lg dark:shadow-dark-700/20 transition duration-300 overflow-hidden border dark:border-dark-700">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                    Active
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">2 days left</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  Sample Election Title {i}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  This is a sample election description that shows how the election card will look when implemented.
                </p>
                
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex justify-between">
                    <span>Votes Cast:</span>
                    <span className="font-medium">127</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Eligible:</span>
                    <span className="font-medium">450</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-300">
                    Vote Now
                  </button>
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-4 rounded-md transition duration-300">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>        {/* Empty State */}
        <div className="text-center py-12 bg-white dark:bg-dark-800 rounded-lg shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 mt-6">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No elections available</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new election.</p>
          <div className="mt-6">
            <Link
              to="/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition duration-300"
            >
              Create Election
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

