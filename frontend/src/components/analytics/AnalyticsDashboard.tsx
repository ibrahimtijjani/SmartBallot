import React from 'react';
import { ElectionAnalytics } from '../../contexts/AnalyticsContext';
import ElectionMetricsCard from './ElectionMetricsCard';
import ParticipationChart from './ParticipationChart';
import VotingTrendsChart from './VotingTrendsChart';

interface AnalyticsDashboardProps {
  electionAnalytics: Map<number, ElectionAnalytics>;
  isLoading: boolean;
  isRealTimeActive: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  electionAnalytics,
  isLoading,
  isRealTimeActive
}) => {
  const analyticsArray = Array.from(electionAnalytics.values());
  const activeElections = analyticsArray.filter(analytics => analytics.isActive);
  const endedElections = analyticsArray.filter(analytics => analytics.isEnded);

  // Calculate aggregate metrics
  const totalActiveVotes = activeElections.reduce(
    (sum, analytics) => sum + analytics.voteCounts.reduce((voteSum, count) => voteSum + count, 0),
    0
  );

  const averageParticipation = activeElections.length > 0
    ? activeElections.reduce((sum, analytics) => sum + analytics.participationRate, 0) / activeElections.length
    : 0;

  const mostActiveElection = activeElections.reduce((max, current) => {
    const currentVotes = current.voteCounts.reduce((sum, count) => sum + count, 0);
    const maxVotes = max ? max.voteCounts.reduce((sum, count) => sum + count, 0) : 0;
    return currentVotes > maxVotes ? current : max;
  }, null as ElectionAnalytics | null);

  if (analyticsArray.length === 0 && !isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Election Data</h3>
        <p className="text-gray-600">
          No elections are currently being tracked. Create some elections to see analytics here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Elections</p>
              <p className="text-2xl font-bold text-gray-900">{activeElections.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Active Votes</p>
              <p className="text-2xl font-bold text-gray-900">{totalActiveVotes.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Participation</p>
              <p className="text-2xl font-bold text-gray-900">{averageParticipation.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Elections</p>
              <p className="text-2xl font-bold text-gray-900">{endedElections.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ParticipationChart electionAnalytics={analyticsArray} />
        <VotingTrendsChart electionAnalytics={analyticsArray} />
      </div>

      {/* Most Active Election Highlight */}
      {mostActiveElection && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Most Active Election</h3>
            {isRealTimeActive && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Updates</span>
              </div>
            )}
          </div>
          <ElectionMetricsCard 
            analytics={mostActiveElection} 
            isHighlighted={true}
            showDetailedMetrics={true}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Updating analytics data...</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
