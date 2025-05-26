import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { StacksTestnet } from '@stacks/network';
import { callReadOnlyFunction, openContractCall } from '@stacks/connect';
import { standardPrincipalCV, uintCV, principalCV, cvToValue } from '@stacks/transactions';

// TODO: Get these from .env or context
const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Replace with actual deployed address
const contractName = 'voting';

interface ElectionDetails {
  id: number;
  question: string;
  creator: string;
  startBlock: number;
  endBlock: number;
  options: string[];
  totalVotes: number;
}

const ElectionDetailsPage: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const { network, userData } = useAuth();
  const [election, setElection] = useState<ElectionDetails | null>(null);
  const [results, setResults] = useState<number[] | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voteTxId, setVoteTxId] = useState<string | null>(null);

  const electionIdUint = electionId ? parseInt(electionId, 10) : 0;

  useEffect(() => {
    const fetchElectionData = async () => {
      if (!electionIdUint) {
        setError('Invalid Election ID');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        // Fetch election details
        const detailsOptions = {
          contractAddress,
          contractName,
          functionName: 'get-election-details',
          functionArgs: [uintCV(electionIdUint)],
          network: network || new StacksTestnet(),
          senderAddress: userData?.profile?.stxAddress?.testnet, // Optional, but good practice
        };
        const detailsResult = await callReadOnlyFunction(detailsOptions);
        const detailsValue = cvToValue(detailsResult);

        if (!detailsValue) {
          throw new Error('Election not found.');
        }
        setElection({
          id: detailsValue.id,
          question: detailsValue.question,
          creator: detailsValue.creator,
          startBlock: detailsValue['start-block'],
          endBlock: detailsValue['end-block'],
          options: detailsValue.options,
          totalVotes: detailsValue['total-votes'],
        });

        // Fetch results if election ended or user voted
        // TODO: Add logic to fetch current block height to compare with endBlock
        const resultsOptions = {
          contractAddress,
          contractName,
          functionName: 'get-election-results',
          functionArgs: [uintCV(electionIdUint)],
          network: network || new StacksTestnet(),
          senderAddress: userData?.profile?.stxAddress?.testnet,
        };
        const resultsResult = await callReadOnlyFunction(resultsOptions);
        if (resultsResult) {
            const resultsValue = cvToValue(resultsResult);
            if (resultsValue.type === 'ok') {
                setResults(resultsValue.value);
            }
        }

        // Check if user has voted
        if (userData) {
          const votedOptions = {
            contractAddress,
            contractName,
            functionName: 'has-voted',
            functionArgs: [uintCV(electionIdUint), principalCV(userData.profile.stxAddress.testnet)],
            network: network || new StacksTestnet(),
            senderAddress: userData.profile.stxAddress.testnet,
          };
          const votedResult = await callReadOnlyFunction(votedOptions);
          setHasVoted(cvToValue(votedResult));
        }

      } catch (err: any) {
        console.error('Error fetching election data:', err);
        setError(`Failed to fetch election data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElectionData();
  }, [electionIdUint, network, userData]); // Re-fetch if user logs in/out

  const handleVote = async () => {
    if (selectedOption === null || !userData || !election) {
      setError('Please select an option and connect your wallet.');
      return;
    }

    // TODO: Check current block height against start/end blocks

    setIsVoting(true);
    setError(null);
    setVoteTxId(null);

    const functionArgs = [
      uintCV(election.id),
      uintCV(selectedOption),
    ];

    const optionsPayload = {
      contractAddress,
      contractName,
      functionName: 'cast-vote',
      functionArgs,
      network: network || new StacksTestnet(),
      appDetails: {
        name: 'Decentralized Voting Platform',
        icon: window.location.origin + '/favicon.ico',
      },
      onFinish: (data: any) => {
        console.log('Vote transaction finished:', data);
        setVoteTxId(data.txId);
        setIsVoting(false);
        setHasVoted(true); // Assume success, might need confirmation
        // Optionally re-fetch results
      },
      onCancel: () => {
        console.log('Vote transaction cancelled');
        setError('Vote transaction cancelled by user.');
        setIsVoting(false);
      },
    };

    try {
      await openContractCall(optionsPayload);
    } catch (err) {
      console.error('Error opening vote contract call:', err);
      setError('Failed to initiate vote transaction. See console for details.');
      setIsVoting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading election details...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">Error: {error}</div>;
  }

  if (!election) {
    return <div className="text-center p-10">Election not found.</div>;
  }

  // TODO: Get current block height for status display
  const isElectionActive = true; // Placeholder
  const canVote = isElectionActive && userData && !hasVoted;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{election.question}</h1>
      <p className="text-sm text-gray-500 mb-1">Created by: {election.creator}</p>
      <p className="text-sm text-gray-500 mb-1">Starts: Block {election.startBlock}, Ends: Block {election.endBlock}</p>
      <p className="text-sm text-gray-500 mb-6">Total Votes Cast: {election.totalVotes}</p>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Options:</h2>
        {election.options.map((option, index) => (
          <div key={index} className="mb-2">
            <label className={`flex items-center p-3 border rounded-md cursor-pointer ${selectedOption === index ? 'bg-blue-100 border-blue-400' : 'border-gray-300 hover:bg-gray-50'}`}>
              <input
                type="radio"
                name="voteOption"
                value={index}
                checked={selectedOption === index}
                onChange={() => setSelectedOption(index)}
                disabled={!canVote || isVoting}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50"
              />
              <span className="flex-grow text-gray-800">{option}</span>
              {results && (
                <span className="ml-4 text-sm font-medium text-gray-600">({results[index]} votes)</span>
              )}
            </label>
          </div>
        ))}
      </div>

      {voteTxId && <p className="text-green-600 mb-4">Vote submitted! Transaction ID: {voteTxId}</p>}
      {error && !voteTxId && <p className="text-red-500 mb-4">Error: {error}</p>}

      {userData ? (
        hasVoted ? (
          <p className="text-center text-green-700 font-semibold">You have already voted in this election.</p>
        ) : isElectionActive ? (
          <button
            onClick={handleVote}
            disabled={selectedOption === null || isVoting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVoting ? 'Submitting Vote...' : 'Cast Your Vote'}
          </button>
        ) : (
          <p className="text-center text-gray-600 font-semibold">This election is not currently active for voting.</p>
        )
      ) : (
        <p className="text-center text-red-500 font-semibold">Please connect your wallet to vote.</p>
      )}

      {/* Display results if available (e.g., after election ends or user voted) */}
      {results && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Results</h2>
          {/* Basic results display, could be enhanced with charts */}
          <ul>
            {election.options.map((option, index) => (
              <li key={index} className="mb-2 flex justify-between items-center">
                <span>{option}:</span>
                <span className="font-semibold">{results[index]} votes</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ElectionDetailsPage;

