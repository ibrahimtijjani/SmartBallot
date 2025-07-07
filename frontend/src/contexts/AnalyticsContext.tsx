import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useVotingContract } from '../hooks/useVotingContract';

// Types for analytics data
export interface ElectionAnalytics {
  election: any;
  voteCounts: number[];
  weightedCounts: number[];
  isActive: boolean;
  isEnded: boolean;
  blocksRemaining: number;
  participationRate: number;
}

export interface PlatformStats {
  totalElections: number;
  currentBlock: number;
  activeElections: number;
  totalVotesCast: number;
}

interface AnalyticsContextType {
  // State
  platformStats: PlatformStats | null;
  electionAnalytics: Map<number, ElectionAnalytics>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPlatformStats: () => Promise<void>;
  fetchElectionAnalytics: (electionId: number) => Promise<void>;
  fetchMultipleElectionAnalytics: (electionIds: number[]) => Promise<void>;
  clearError: () => void;
  
  // Real-time updates
  startRealTimeUpdates: (electionIds?: number[]) => void;
  stopRealTimeUpdates: () => void;
  isRealTimeActive: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [electionAnalytics, setElectionAnalytics] = useState<Map<number, ElectionAnalytics>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [updateInterval, setUpdateInterval] = useState<NodeJS.Timeout | null>(null);

  const votingContract = useVotingContract();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchPlatformStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For now, we'll simulate the platform stats since the contract functions are new
      // In a real implementation, this would call the contract's get-platform-stats function
      const electionCount = await votingContract.getElectionCount();
      
      const mockStats: PlatformStats = {
        totalElections: electionCount,
        currentBlock: Date.now(), // Simulated block height
        activeElections: Math.floor(electionCount * 0.3), // Simulate 30% active
        totalVotesCast: electionCount * 15 // Simulate average votes per election
      };
      
      setPlatformStats(mockStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch platform stats');
    } finally {
      setIsLoading(false);
    }
  }, [votingContract]);

  const fetchElectionAnalytics = useCallback(async (electionId: number) => {
    try {
      setError(null);
      
      // Fetch election details and results
      const [electionDetails, electionResults] = await Promise.all([
        votingContract.getElectionDetails(electionId),
        votingContract.getElectionResults(electionId)
      ]);

      if (!electionDetails || !electionResults) {
        throw new Error(`Election ${electionId} not found`);
      }

      // Fetch weighted results if it's a weighted election
      let weightedResults: number[] = [];
      if (electionDetails.votingType === 'weighted') {
        const weightedData = await votingContract.getWeightedElectionResults(electionId);
        weightedResults = weightedData || [];
      }

      // Calculate analytics
      const currentBlock = Date.now(); // Simulated current block
      const isActive = currentBlock >= electionDetails.startBlock && currentBlock < electionDetails.endBlock;
      const isEnded = currentBlock >= electionDetails.endBlock;
      const blocksRemaining = isActive ? electionDetails.endBlock - currentBlock : 0;
      
      // Calculate participation rate (simplified)
      const totalVotes = electionResults.reduce((sum, count) => sum + count, 0);
      const participationRate = totalVotes > 0 ? Math.min((totalVotes / 100) * 100, 100) : 0;

      const analytics: ElectionAnalytics = {
        election: electionDetails,
        voteCounts: electionResults,
        weightedCounts: weightedResults,
        isActive,
        isEnded,
        blocksRemaining,
        participationRate
      };

      setElectionAnalytics(prev => new Map(prev.set(electionId, analytics)));
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to fetch analytics for election ${electionId}`);
    }
  }, [votingContract]);

  const fetchMultipleElectionAnalytics = useCallback(async (electionIds: number[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch analytics for multiple elections in parallel
      await Promise.all(electionIds.map(id => fetchElectionAnalytics(id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch multiple election analytics');
    } finally {
      setIsLoading(false);
    }
  }, [fetchElectionAnalytics]);

  const startRealTimeUpdates = useCallback((electionIds?: number[]) => {
    if (isRealTimeActive) return;

    setIsRealTimeActive(true);
    
    const interval = setInterval(async () => {
      try {
        // Update platform stats
        await fetchPlatformStats();
        
        // Update specific elections or all tracked elections
        const idsToUpdate = electionIds || Array.from(electionAnalytics.keys());
        if (idsToUpdate.length > 0) {
          await Promise.all(idsToUpdate.map(id => fetchElectionAnalytics(id)));
        }
      } catch (err) {
        console.error('Real-time update failed:', err);
      }
    }, 10000); // Update every 10 seconds

    setUpdateInterval(interval);
  }, [isRealTimeActive, fetchPlatformStats, fetchElectionAnalytics, electionAnalytics]);

  const stopRealTimeUpdates = useCallback(() => {
    if (updateInterval) {
      clearInterval(updateInterval);
      setUpdateInterval(null);
    }
    setIsRealTimeActive(false);
  }, [updateInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, [updateInterval]);

  const value: AnalyticsContextType = {
    platformStats,
    electionAnalytics,
    isLoading,
    error,
    fetchPlatformStats,
    fetchElectionAnalytics,
    fetchMultipleElectionAnalytics,
    clearError,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    isRealTimeActive
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
