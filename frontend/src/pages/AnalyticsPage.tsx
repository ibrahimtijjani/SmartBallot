import React, { useEffect, useState } from 'react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useVotingContract } from '../hooks/useVotingContract';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import PlatformStatsCard from '../components/analytics/PlatformStatsCard';
import ActiveElectionsGrid from '../components/analytics/ActiveElectionsGrid';

const AnalyticsPage: React.FC = () => {
  const {
    platformStats,
    electionAnalytics,
    isLoading,
    error,
    fetchPlatformStats,
    fetchMultipleElectionAnalytics,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    isRealTimeActive,
    clearError
  } = useAnalytics();

  const votingContract = useVotingContract();
  const [activeElectionIds, setActiveElectionIds] = useState<number[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize analytics data
  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        setIsInitializing(true);
        
        // Fetch platform stats
        await fetchPlatformStats();
        
        // Get all elections and identify active ones
        const electionCount = await votingContract.getElectionCount();
        const electionIds = Array.from({ length: electionCount }, (_, i) => i + 1);
        
        // Fetch details for all elections to identify active ones
        const activeIds: number[] = [];
        for (const id of electionIds) {
          try {
            const details = await votingContract.getElectionDetails(id);
            if (details) {
              const currentTime = Date.now();
              const isActive = currentTime >= details.startBlock && currentTime < details.endBlock;
              if (isActive) {
                activeIds.push(id);
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch details for election ${id}:`, err);
          }
        }
        
        setActiveElectionIds(activeIds);
        
        // Fetch analytics for active elections
        if (activeIds.length > 0) {
          await fetchMultipleElectionAnalytics(activeIds);
        }
        
      } catch (err) {
        console.error('Failed to initialize analytics:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAnalytics();
  }, [fetchPlatformStats, fetchMultipleElectionAnalytics, votingContract]);

  // Start real-time updates for active elections
  useEffect(() => {
    if (activeElectionIds.length > 0 && !isRealTimeActive) {
      startRealTimeUpdates(activeElectionIds);
    }

    return () => {
      stopRealTimeUpdates();
    };
  }, [activeElectionIds, startRealTimeUpdates, stopRealTimeUpdates, isRealTimeActive]);

  const handleRefresh = async () => {
    clearError();
    await fetchPlatformStats();
    if (activeElectionIds.length > 0) {
      await fetchMultipleElectionAnalytics(activeElectionIds);
    }
  };

  const toggleRealTimeUpdates = () => {
    if (isRealTimeActive) {
      stopRealTimeUpdates();
    } else {
      startRealTimeUpdates(activeElectionIds);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing analytics dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Election Analytics</h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring and analytics for all elections
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
          
          <button
            onClick={toggleRealTimeUpdates}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              isRealTimeActive 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isRealTimeActive ? 'bg-white animate-pulse' : 'bg-gray-500'}`}></div>
            <span>{isRealTimeActive ? 'Live Updates On' : 'Live Updates Off'}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Platform Stats */}
      {platformStats && <PlatformStatsCard stats={platformStats} />}

      {/* Main Analytics Dashboard */}
      <AnalyticsDashboard 
        electionAnalytics={electionAnalytics}
        isLoading={isLoading}
        isRealTimeActive={isRealTimeActive}
      />

      {/* Active Elections Grid */}
      <ActiveElectionsGrid 
        electionAnalytics={electionAnalytics}
        activeElectionIds={activeElectionIds}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AnalyticsPage;
