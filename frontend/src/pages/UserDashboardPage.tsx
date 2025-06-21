import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Mock data structure for elections - replace with actual API calls
interface Election {
  id: string;
  title: string;
  description: string;
  startBlock: number;
  endBlock: number;
  status: 'upcoming' | 'active' | 'completed';
  totalVotes: number;
  options: string[];
  createdAt: Date;
}

const UserDashboardPage: React.FC = () => {
  const { userData } = useAuth();
  const [createdElections, setCreatedElections] = useState<Election[]>([]);
  const [votedElections, setVotedElections] = useState<Election[]>([]);
  const [activeTab, setActiveTab] = useState<'created' | 'voted'>('created');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual smart contract calls
  useEffect(() => {
    const fetchUserElections = async () => {
      setIsLoading(true);
      
      // Mock created elections
      const mockCreatedElections: Election[] = [
        {
          id: '1',
          title: 'Community Budget Allocation 2025',
          description: 'Vote on how community funds should be allocated for the next fiscal year.',
          startBlock: 100100,
          endBlock: 100500,
          status: 'active',
          totalVotes: 156,
          options: ['Infrastructure', 'Education', 'Healthcare', 'Environment'],
          createdAt: new Date('2025-06-15')
        },
        {
          id: '2',
          title: 'New Feature Implementation',
          description: 'Choose which feature should be prioritized for the next development sprint.',
          startBlock: 100600,
          endBlock: 100800,
          status: 'upcoming',
          totalVotes: 0,
          options: ['Mobile App', 'Advanced Analytics', 'API Integration'],
          createdAt: new Date('2025-06-20')
        },
        {
          id: '3',
          title: 'Governance Protocol Update',
          description: 'Vote on proposed changes to the governance protocol.',
          startBlock: 99500,
          endBlock: 99900,
          status: 'completed',
          totalVotes: 342,
          options: ['Approve', 'Reject', 'Modify'],
          createdAt: new Date('2025-06-10')
        }
      ];

      // Mock voted elections
      const mockVotedElections: Election[] = [
        {
          id: '4',
          title: 'Community Event Planning',
          description: 'Select the type of community event for next month.',
          startBlock: 99800,
          endBlock: 100000,
          status: 'completed',
          totalVotes: 89,
          options: ['Workshop', 'Networking', 'Hackathon'],
          createdAt: new Date('2025-06-12')
        }
      ];

      // Simulate API delay
      setTimeout(() => {
        setCreatedElections(mockCreatedElections);
        setVotedElections(mockVotedElections);
        setIsLoading(false);
      }, 1000);
    };

    if (userData) {
      fetchUserElections();
    }
  }, [userData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!userData) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Authentication Required</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Please connect your wallet to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 border dark:border-dark-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your elections and voting activity
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-md transition duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Election
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 border dark:border-dark-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Elections Created</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{createdElections.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 border dark:border-dark-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Votes Cast</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{votedElections.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 border dark:border-dark-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Elections</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {createdElections.filter(e => e.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 border dark:border-dark-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Participants</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {createdElections.reduce((sum, election) => sum + election.totalVotes, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md border dark:border-dark-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('created')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'created'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              My Elections ({createdElections.length})
            </button>
            <button
              onClick={() => setActiveTab('voted')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'voted'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Voted Elections ({votedElections.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading elections...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(activeTab === 'created' ? createdElections : votedElections).map((election) => (
                <div key={election.id} className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{election.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                          {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{election.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Created: {formatDate(election.createdAt)}</span>
                        <span>Votes: {election.totalVotes}</span>
                        <span>Options: {election.options.length}</span>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-4 flex space-x-2">
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                        View Details
                      </button>
                      {activeTab === 'created' && election.status !== 'completed' && (
                        <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                          Manage
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {(activeTab === 'created' ? createdElections : votedElections).length === 0 && (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No {activeTab} elections
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {activeTab === 'created' 
                      ? 'You haven\'t created any elections yet. Get started by creating your first election.'
                      : 'You haven\'t voted in any elections yet. Browse available elections to participate.'
                    }
                  </p>
                  {activeTab === 'created' && (
                    <div className="mt-6">
                      <Link
                        to="/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition duration-300"
                      >
                        Create Election
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
