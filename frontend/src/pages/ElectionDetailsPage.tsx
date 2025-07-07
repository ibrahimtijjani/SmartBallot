import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useVotingContract } from '../hooks/useVotingContract';
import LiveVoteCounter from '../components/analytics/LiveVoteCounter';

const ElectionDetailsPage: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const { userData } = useAuth();
  const { 
    electionAnalytics, 
    fetchElectionAnalytics, 
    startRealTimeUpdates, 
    stopRealTimeUpdates,
    isRealTimeActive,
    isLoading: analyticsLoading,
    error: analyticsError 
  } = useAnalytics();
  
  const votingContract = useVotingContract();
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voteTxId, setVoteTxId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  const electionIdUint = electionId ? parseInt(electionId, 10) : 0;
  const currentAnalytics = electionAnalytics.get(electionIdUint);

  // Initialize election data and real-time updates
  useEffect(() => {
    const initializeElection = async () => {
      if (!electionIdUint) {
        setError('Invalid Election ID');
        return;
      }

      try {
        setError(null);
        
        // Fetch election analytics
        await fetchElectionAnalytics(electionIdUint);
        
        // Check if user has voted
        if (userData?.profile?.stxAddress) {
          const voted = await votingContract.hasVoted(electionIdUint);
          setHasVoted(voted);
        }
        
        // Start real-time updates for this election
        startRealTimeUpdates([electionIdUint]);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load election data');
      }
    };

    initializeElection();

    // Cleanup: stop real-time updates when component unmounts
    return () => {
      stopRealTimeUpdates();
    };
  }, [electionIdUint, fetchElectionAnalytics, startRealTimeUpdates, stopRealTimeUpdates, userData, votingContract]);

  // Handle voting
  const handleVote = async () => {
    if (selectedOption === null || !userData) {
      setError('Please select an option and ensure you are signed in.');
      return;
    }

    setIsVoting(true);
    setError(null);

    try {
      await votingContract.castVote(electionIdUint, selectedOption, {
        onFinish: (data: any) => {
          console.log('Vote transaction submitted:', data);
          setVoteTxId(data.txId);
          setHasVoted(true);
          setIsVoting(false);
          // Refresh analytics data
          setTimeout(() => {
            fetchElectionAnalytics(electionIdUint);
          }, 3000);
        },
        onCancel: () => {
          console.log('Vote transaction cancelled');
          setIsVoting(false);
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit vote.');
      setIsVoting(false);
    }
  };

  // Loading state
  if (analyticsLoading && !currentAnalytics) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading election details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || analyticsError) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
        <p className="text-red-600">{error || analyticsError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Election not found
  if (!currentAnalytics) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Election Not Found</h2>
        <p className="text-gray-600">The requested election could not be found.</p>
        <Link
          to="/"
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const { election } = currentAnalytics;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>›</span>
        <Link to="/analytics" className="hover:text-blue-600">Analytics</Link>
        <span>›</span>
        <span className="text-gray-900">Election #{election.id}</span>
      </nav>

      {/* Election Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{election.question}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Election #{election.id}</span>
              <span>•</span>
              <span>Type: {election.votingType}</span>
              <span>•</span>
              <span>Created by: {election.creator}</span>
            </div>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
              <span>Blocks: {election.startBlock} - {election.endBlock}</span>
              {election.useAllowlist && (
                <>
                  <span>•</span>
                  <span className="text-blue-600">Allowlist Enabled</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isRealTimeActive && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Updates</span>
              </div>
            )}
            
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentAnalytics.isActive ? 'bg-green-100 text-green-800' :
              currentAnalytics.isEnded ? 'bg-gray-100 text-gray-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {currentAnalytics.isActive ? 'Active' : currentAnalytics.isEnded ? 'Ended' : 'Upcoming'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voting Section */}
        <div className="lg:col-span-1 space-y-6">
          {!hasVoted && userData && currentAnalytics.isActive && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cast Your Vote</h2>
              <div className="space-y-3">
                {election.options.map((option: string, index: number) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOption === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="vote-option"
                      value={index}
                      checked={selectedOption === index}
                      onChange={() => setSelectedOption(index)}
                      className="mr-3 text-blue-600"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleVote}
                disabled={selectedOption === null || isVoting}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isVoting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{isVoting ? 'Submitting Vote...' : 'Submit Vote'}</span>
              </button>
            </div>
          )}

          {/* Vote Confirmation */}
          {voteTxId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Vote Submitted!</h3>
              <p className="text-green-600 text-sm">
                Your vote has been submitted successfully.
              </p>
              <p className="text-xs text-green-500 mt-2 break-all">
                TX: {voteTxId}
              </p>
            </div>
          )}

          {/* Already Voted Message */}
          {hasVoted && !voteTxId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Already Voted</h3>
              <p className="text-blue-600">You have already cast your vote in this election.</p>
            </div>
          )}

          {/* Election Not Active */}
          {!currentAnalytics.isActive && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {currentAnalytics.isEnded ? 'Election Ended' : 'Election Not Started'}
              </h3>
              <p className="text-gray-600">
                {currentAnalytics.isEnded 
                  ? 'This election has ended. You can view the final results.'
                  : 'This election has not started yet. Check back later.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Live Results Section */}
        <div className="lg:col-span-2">
          <LiveVoteCounter 
            analytics={currentAnalytics}
            isRealTime={isRealTimeActive}
            showProgress={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ElectionDetailsPage;
