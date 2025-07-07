import React from 'react';
import { PlatformStats } from '../../contexts/AnalyticsContext';
import { formatDistanceToNow } from 'date-fns';

interface PlatformStatsCardProps {
  stats: PlatformStats;
}

const PlatformStatsCard: React.FC<PlatformStatsCardProps> = ({ stats }) => {
  const activePercentage = stats.totalElections > 0 
    ? (stats.activeElections / stats.totalElections) * 100 
    : 0;

  const avgVotesPerElection = stats.totalElections > 0 
    ? stats.totalVotesCast / stats.totalElections 
    : 0;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Platform Overview</h2>
          <p className="text-blue-100 mt-1">
            Real-time statistics across all elections
          </p>
        </div>
        <div className="text-right">
          <p className="text-blue-100 text-sm">Current Block</p>
          <p className="text-xl font-semibold">{stats.currentBlock.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Elections */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2a2 2 0 002 2m0 0h14m-14 0a2 2 0 002 2v2a2 2 0 01-2 2" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Total Elections</p>
              <p className="text-2xl font-bold">{stats.totalElections}</p>
            </div>
          </div>
        </div>

        {/* Active Elections */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 bg-opacity-80 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Active Elections</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold">{stats.activeElections}</p>
                <p className="text-sm text-blue-200">({activePercentage.toFixed(1)}%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Votes */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-500 bg-opacity-80 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Total Votes Cast</p>
              <p className="text-2xl font-bold">{stats.totalVotesCast.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Average Engagement */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-orange-500 bg-opacity-80 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Avg Votes/Election</p>
              <p className="text-2xl font-bold">{avgVotesPerElection.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="mt-6 pt-6 border-t border-blue-400 border-opacity-30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-blue-100 text-sm">Platform Activity</p>
            <p className="text-lg font-semibold">
              {activePercentage > 50 ? 'High' : activePercentage > 20 ? 'Medium' : 'Low'}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Engagement Level</p>
            <p className="text-lg font-semibold">
              {avgVotesPerElection > 20 ? 'Excellent' : avgVotesPerElection > 10 ? 'Good' : 'Growing'}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Network Status</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-lg font-semibold">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformStatsCard;
