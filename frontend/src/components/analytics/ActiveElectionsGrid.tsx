import React from 'react';
import { ElectionAnalytics } from '../../contexts/AnalyticsContext';
import ElectionMetricsCard from './ElectionMetricsCard';

interface ActiveElectionsGridProps {
  electionAnalytics: Map<number, ElectionAnalytics>;
  activeElectionIds: number[];
  isLoading: boolean;
}

const ActiveElectionsGrid: React.FC<ActiveElectionsGridProps> = ({
  electionAnalytics,
  activeElectionIds,
  isLoading
}) => {
  const activeElections = activeElectionIds
    .map(id => electionAnalytics.get(id))
    .filter((analytics): analytics is ElectionAnalytics => analytics !== undefined)
    .sort((a, b) => {
      // Sort by total votes (descending) for most active first
      const aVotes = a.voteCounts.reduce((sum, count) => sum + count, 0);
      const bVotes = b.voteCounts.reduce((sum, count) => sum + count, 0);
      return bVotes - aVotes;
    });

  if (isLoading && activeElections.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Active Elections</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeElections.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Active Elections</h2>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Elections</h3>
          <p className="text-gray-600 mb-4">
            There are currently no active elections. Elections will appear here when they are in progress.
          </p>
          <div className="text-sm text-gray-500">
            <p>Elections are considered active when:</p>
            <ul className="mt-2 space-y-1">
              <li>• The current block is between start and end blocks</li>
              <li>• Voting is currently open</li>
              <li>• The election has not yet ended</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Active Elections</h2>
          <p className="text-sm text-gray-600 mt-1">
            {activeElections.length} election{activeElections.length !== 1 ? 's' : ''} currently accepting votes
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Sort Options */}
          <div className="text-sm text-gray-600">
            Sorted by activity
          </div>
          
          {/* Live Indicator */}
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Data</span>
          </div>
        </div>
      </div>

      {/* Elections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeElections.map((analytics) => (
          <ElectionMetricsCard
            key={analytics.election.id}
            analytics={analytics}
            showDetailedMetrics={false}
          />
        ))}
      </div>

      {/* Quick Stats for Active Elections */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Elections Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {activeElections.reduce((sum, analytics) => 
                sum + analytics.voteCounts.reduce((voteSum, count) => voteSum + count, 0), 0
              )}
            </p>
            <p className="text-sm text-gray-600">Total Active Votes</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {activeElections.length > 0 
                ? (activeElections.reduce((sum, analytics) => sum + analytics.participationRate, 0) / activeElections.length).toFixed(1)
                : 0}%
            </p>
            <p className="text-sm text-gray-600">Avg Participation</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {new Set(activeElections.map(analytics => analytics.election.votingType)).size}
            </p>
            <p className="text-sm text-gray-600">Voting Types</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {Math.min(...activeElections.map(analytics => analytics.blocksRemaining))}
            </p>
            <p className="text-sm text-gray-600">Min Blocks Left</p>
          </div>
        </div>

        {/* Voting Type Breakdown */}
        <div className="mt-6 pt-6 border-t border-green-200">
          <h4 className="text-md font-medium text-gray-900 mb-3">Active Voting Types</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(activeElections.map(analytics => analytics.election.votingType))).map(type => {
              const count = activeElections.filter(analytics => analytics.election.votingType === type).length;
              return (
                <span
                  key={type}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')} ({count})
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading Indicator for Updates */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Updating election data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveElectionsGrid;
