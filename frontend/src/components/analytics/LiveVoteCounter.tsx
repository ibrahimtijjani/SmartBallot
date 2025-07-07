import React, { useEffect, useState } from 'react';
import { ElectionAnalytics } from '../../contexts/AnalyticsContext';

interface LiveVoteCounterProps {
  analytics: ElectionAnalytics | null;
  isRealTime?: boolean;
  showProgress?: boolean;
}

const LiveVoteCounter: React.FC<LiveVoteCounterProps> = ({
  analytics,
  isRealTime = false,
  showProgress = true
}) => {
  const [animatedCounts, setAnimatedCounts] = useState<number[]>([]);
  const [previousCounts, setPreviousCounts] = useState<number[]>([]);

  // Animate vote count changes
  useEffect(() => {
    if (!analytics) return;

    const newCounts = analytics.voteCounts;
    
    if (previousCounts.length === 0) {
      setAnimatedCounts(newCounts);
      setPreviousCounts(newCounts);
      return;
    }

    // Animate changes
    const hasChanges = newCounts.some((count, index) => count !== previousCounts[index]);
    
    if (hasChanges) {
      // Start with previous counts
      setAnimatedCounts(previousCounts);
      
      // Animate to new counts after a short delay
      setTimeout(() => {
        setAnimatedCounts(newCounts);
        setPreviousCounts(newCounts);
      }, 100);
    }
  }, [analytics?.voteCounts, previousCounts]);

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { election, voteCounts, weightedCounts, isActive, isEnded, blocksRemaining } = analytics;
  const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);
  const totalWeightedVotes = weightedCounts.reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Live Vote Results</h3>
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-sm text-gray-600">
              Total Votes: <span className="font-medium">{totalVotes}</span>
            </p>
            {election.votingType === 'weighted' && totalWeightedVotes > 0 && (
              <p className="text-sm text-gray-600">
                Weighted: <span className="font-medium">{totalWeightedVotes}</span>
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {isRealTime && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          )}
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isActive ? 'bg-green-100 text-green-800' :
            isEnded ? 'bg-gray-100 text-gray-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {isActive ? 'Active' : isEnded ? 'Ended' : 'Upcoming'}
          </div>
        </div>
      </div>

      {/* Blocks Remaining (if active) */}
      {isActive && blocksRemaining > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-orange-800">
                {blocksRemaining} blocks remaining
              </p>
              <p className="text-xs text-orange-600">
                Voting ends at block {election.endBlock}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vote Results */}
      <div className="space-y-4">
        {election.options.map((option: string, index: number) => {
          const votes = animatedCounts[index] || voteCounts[index] || 0;
          const weightedVotes = weightedCounts[index] || 0;
          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
          const weightedPercentage = totalWeightedVotes > 0 ? (weightedVotes / totalWeightedVotes) * 100 : 0;
          
          const isLeading = votes === Math.max(...voteCounts) && votes > 0;
          const hasNewVotes = previousCounts[index] !== undefined && votes > previousCounts[index];

          return (
            <div 
              key={index} 
              className={`p-4 rounded-lg border transition-all duration-500 ${
                isLeading ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
              } ${hasNewVotes ? 'ring-2 ring-blue-300 ring-opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">{option}</h4>
                  {isLeading && votes > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Leading
                    </span>
                  )}
                </div>
                
                <div className="text-right">
                  <p className={`text-lg font-bold transition-all duration-300 ${
                    hasNewVotes ? 'text-blue-600 scale-110' : 'text-gray-900'
                  }`}>
                    {votes} vote{votes !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                  {election.votingType === 'weighted' && weightedVotes > 0 && (
                    <p className="text-xs text-purple-600">
                      {weightedVotes} weighted ({weightedPercentage.toFixed(1)}%)
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {showProgress && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ease-out ${
                        isLeading ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  
                  {election.votingType === 'weighted' && weightedVotes > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${weightedPercentage}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No Votes Message */}
      {totalVotes === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>No votes have been cast yet</p>
          {isActive && <p className="text-sm mt-1">Be the first to vote!</p>}
        </div>
      )}

      {/* Analytics Link */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <Link
          to="/analytics"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          View detailed analytics
        </Link>
      </div>
    </div>
  );
};

export default LiveVoteCounter;
