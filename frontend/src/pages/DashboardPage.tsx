import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Election {
  id: string;
  question: string;
  status: 'draft' | 'upcoming' | 'active' | 'completed';
  startBlock: number;
  endBlock: number;
  totalVotes: number;
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  const { userData } = useAuth();
  
  // Mock data - in a real app, this would come from the smart contract
  const [userElections] = useState<Election[]>([
    {
      id: '1',
      question: 'Should we implement new governance features?',
      status: 'active',
      startBlock: 100500,
      endBlock: 100600,
      totalVotes: 127,
      createdAt: '2025-06-20',
    },
    {
      id: '2',
      question: 'Budget allocation for Q3 2025',
      status: 'completed',
      startBlock: 100200,
      endBlock: 100300,
      totalVotes: 324,
      createdAt: '2025-06-18',
    },
    {
      id: '3',
      question: 'Community event planning discussion',
      status: 'upcoming',
      startBlock: 100800,
      endBlock: 100900,
      totalVotes: 0,
      createdAt: '2025-06-21',
    },
  ]);

  const getStatusBadge = (status: Election['status']) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`;
      case 'completed':
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300`;
      case 'upcoming':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`;
      case 'draft':
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`;
    }
  };

  const getStatusIcon = (status: Election['status']) => {
    switch (status) {
      case 'active':
        return (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'upcoming':
        return (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (!userData) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Connect Your Wallet</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You need to connect your wallet to view your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your elections and track their progress
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4">
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition duration-300"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Election
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-dark-800 overflow-hidden shadow rounded-lg border dark:border-dark-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Elections</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{userElections.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 overflow-hidden shadow rounded-lg border dark:border-dark-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Elections</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {userElections.filter(e => e.status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 overflow-hidden shadow rounded-lg border dark:border-dark-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Votes</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {userElections.reduce((sum, e) => sum + e.totalVotes, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 overflow-hidden shadow rounded-lg border dark:border-dark-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Completed</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {userElections.filter(e => e.status === 'completed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elections List */}
      <div className="bg-white dark:bg-dark-800 shadow overflow-hidden sm:rounded-md border dark:border-dark-700">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-dark-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Your Elections</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Elections you have created and are managing
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-dark-700">
          {userElections.map((election) => (
            <li key={election.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <span className={getStatusBadge(election.status)}>
                        {getStatusIcon(election.status)}
                        {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white truncate">
                      {election.question}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                      <span>Created: {new Date(election.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Votes: {election.totalVotes}</span>
                      <span>•</span>
                      <span>Blocks: {election.startBlock} - {election.endBlock}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/election/${election.id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-dark-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700 transition duration-300"
                    >
                      View
                    </Link>
                    {election.status === 'draft' && (
                      <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition duration-300">
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Empty State */}
      {userElections.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-dark-800 rounded-lg shadow border dark:border-dark-700">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No elections</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first election.</p>
          <div className="mt-6">
            <Link
              to="/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition duration-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Election
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
