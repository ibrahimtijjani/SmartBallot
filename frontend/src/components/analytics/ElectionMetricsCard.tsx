import React from 'react';
import { ElectionAnalytics } from '../../contexts/AnalyticsContext';
import { Link } from 'react-router-dom';

interface ElectionMetricsCardProps {
  analytics: ElectionAnalytics;
  isHighlighted?: boolean;
  showDetailedMetrics?: boolean;
}

const ElectionMetricsCard: React.FC<ElectionMetricsCardProps> = ({
  analytics,
  isHighlighted = false,
  showDetailedMetrics = false
}) => {
  const { election, voteCounts, weightedCounts, isActive, isEnded, blocksRemaining, participationRate } = analytics;
  
  const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);
  const totalWeightedVotes = weightedCounts.reduce((sum, count) => sum + count, 0);
  
  // Find the leading option
  const leadingOptionIndex = voteCounts.indexOf(Math.max(...voteCounts));
  const leadingOption = election.options[leadingOptionIndex];
  const leadingVotes = voteCounts[leadingOptionIndex];
  const leadingPercentage = totalVotes > 0 ? (leadingVotes / totalVotes) * 100 : 0;

  // Determine status
  const getStatusInfo = () => {
    if (isActive) {
      return {
        status: 'Active',
        color: 'bg-green-100 text-green-800',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      };
    } else if (isEnded) {
      return {
        status: 'Ended',
        color: 'bg-gray-100 text-gray-800',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      };
    } else {
      return {
        status: 'Upcoming',
        color: 'bg-blue-100 text-blue-800',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      };
    }
  };

  const statusInfo = getStatusInfo();

  const cardClasses = `
    bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md
    ${isHighlighted ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'}
  `;

  return (
    <div className={cardClasses}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {election.question}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Election #{election.id} • {election.votingType}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.icon}
              <span className="ml-1">{statusInfo.status}</span>
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Votes</p>
            <p className="text-2xl font-bold text-gray-900">{totalVotes}</p>
            {election.votingType === 'weighted' && totalWeightedVotes > 0 && (
              <p className="text-xs text-gray-500">({totalWeightedVotes} weighted)</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Participation</p>
            <p className="text-2xl font-bold text-gray-900">{participationRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Leading Option */}
        {totalVotes > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-1">Leading Option</p>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900 truncate">{leadingOption}</p>
              <div className="text-right ml-2">
                <p className="font-bold text-green-600">{leadingVotes} votes</p>
                <p className="text-xs text-gray-500">{leadingPercentage.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Metrics (if enabled) */}
        {showDetailedMetrics && (
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Start Block</p>
                <p className="font-medium">{election.startBlock}</p>
              </div>
              <div>
                <p className="text-gray-600">End Block</p>
                <p className="font-medium">{election.endBlock}</p>
              </div>
            </div>
            
            {isActive && blocksRemaining > 0 && (
              <div>
                <p className="text-sm text-gray-600">Blocks Remaining</p>
                <p className="font-medium text-orange-600">{blocksRemaining}</p>
              </div>
            )}

            {election.useAllowlist && (
              <div className="flex items-center space-x-2 text-sm">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-gray-600">Allowlist Enabled</span>
              </div>
            )}

            {election.tokenContract && (
              <div className="flex items-center space-x-2 text-sm">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-gray-600">Token Gated</span>
              </div>
            )}
          </div>
        )}

        {/* Vote Distribution */}
        {totalVotes > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Vote Distribution</p>
            <div className="space-y-2">
              {election.options.map((option: string, index: number) => {
                const votes = voteCounts[index];
                const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                return (
                  <div key={index} className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-700 truncate">{option}</p>
                        <p className="text-sm text-gray-600">{votes} ({percentage.toFixed(1)}%)</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-gray-200">
          <Link
            to={`/election/${election.id}`}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
          >
            View Details
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ElectionMetricsCard;
