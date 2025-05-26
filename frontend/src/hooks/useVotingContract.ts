import { useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  callReadOnlyFunction,
  openContractCall,
  ClarityValue,
  cvToValue,
  uintCV,
  stringUtf8CV,
  listCV,
  principalCV,
  standardPrincipalCV,
} from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK, APP_NAME, APP_ICON } from '../lib/constants';

// Define the structure for election details based on the contract's map
interface ElectionData {
  id: number;
  question: string;
  creator: string;
  startBlock: number;
  endBlock: number;
  options: string[];
  totalVotes: number;
}

/**
 * Custom hook for interacting with the voting smart contract.
 * Provides methods for calling read-only functions and public functions (transactions).
 * Encapsulates contract address, name, and network configuration.
 */
export const useVotingContract = () => {
  const { network, userData, userSession } = useAuth();

  // Memoize the contract principal ClarityValue for efficiency
  const contractPrincipal = useMemo(() => standardPrincipalCV(CONTRACT_ADDRESS), []);

  /**
   * Gets the appropriate Stacks network instance based on configuration.
   * @returns {StacksMainnet | StacksTestnet} The network instance.
   */
  const getNetwork = useCallback(() => {
    // Ensure network is always defined, defaulting to Testnet if needed
    if (network) return network;
    return NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
  }, [network]);

  /**
   * Gets the sender's address for the current network.
   * @returns {string | undefined} The user's Stacks address or undefined if not logged in.
   */
  const getSenderAddress = useCallback(() => {
    return userData?.profile?.stxAddress?.[NETWORK === 'mainnet' ? 'mainnet' : 'testnet'];
  }, [userData]);

  // --- Read-Only Functions --- //

  /**
   * Fetches the total number of elections created.
   * Calls the `get-election-count` read-only function.
   * @returns {Promise<number>} The total count of elections.
   */
  const getElectionCount = useCallback(async (): Promise<number> => {
    const options = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-election-count',
      functionArgs: [],
      network: getNetwork(),
      senderAddress: getSenderAddress(), // Optional for read-only, but good practice
    };
    try {
      const result = await callReadOnlyFunction(options);
      // Assuming the function returns (ok uint)
      const countResult = cvToValue(result);
      if (countResult && countResult.type === 'ok') {
        return Number(countResult.value); // Convert Clarity uint to number
      }
      throw new Error('Invalid response format from get-election-count');
    } catch (error) {
      console.error('Error fetching election count:', error);
      throw new Error('Failed to fetch election count.');
    }
  }, [getNetwork, getSenderAddress]);

  /**
   * Fetches the details for a specific election by its ID.
   * Calls the `get-election-details` read-only function.
   * @param {number} electionId - The ID of the election to fetch.
   * @returns {Promise<ElectionData | null>} Election details or null if not found.
   */
  const getElectionDetails = useCallback(async (electionId: number): Promise<ElectionData | null> => {
    const options = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-election-details',
      functionArgs: [uintCV(electionId)],
      network: getNetwork(),
      senderAddress: getSenderAddress(),
    };
    try {
      const result = await callReadOnlyFunction(options);
      const value = cvToValue(result); // Returns Optional<ElectionTuple> or None
      if (value) { // Check if the result is Some (not None)
        return {
          id: Number(value.id),
          question: value.question,
          creator: value.creator,
          startBlock: Number(value['start-block']),
          endBlock: Number(value['end-block']),
          options: value.options.map((opt: any) => opt), // Assuming options are strings
          totalVotes: Number(value['total-votes']),
        };
      }
      return null; // Election not found (contract returned None)
    } catch (error) {
      console.error(`Error fetching details for election ${electionId}:`, error);
      // Distinguish between 'not found' and other errors if possible based on contract errors
      throw new Error(`Failed to fetch details for election ${electionId}.`);
    }
  }, [getNetwork, getSenderAddress]);

  /**
   * Fetches the results (vote counts) for a specific election.
   * Calls the `get-election-results` read-only function.
   * @param {number} electionId - The ID of the election.
   * @returns {Promise<number[] | null>} A list of vote counts corresponding to options, or null on error/not found.
   */
  const getElectionResults = useCallback(async (electionId: number): Promise<number[] | null> => {
    const options = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-election-results',
      functionArgs: [uintCV(electionId)],
      network: getNetwork(),
      senderAddress: getSenderAddress(),
    };
    try {
      const result = await callReadOnlyFunction(options);
      const value = cvToValue(result); // Returns (ok (list uint)) or (err ...)
      if (value.type === 'ok') {
        return value.value.map((count: any) => Number(count)); // Convert Clarity uints to numbers
      }
      // Handle specific contract errors if needed (e.g., ERR-ELECTION-NOT-FOUND)
      console.warn(`Could not get results for election ${electionId}:`, value.value); // Log the error value
      return null;
    } catch (error) {
      console.error(`Error fetching results for election ${electionId}:`, error);
      throw new Error(`Failed to fetch results for election ${electionId}.`);
    }
  }, [getNetwork, getSenderAddress]);

  /**
   * Checks if a specific voter has already voted in an election.
   * Calls the `has-voted` read-only function.
   * @param {number} electionId - The ID of the election.
   * @param {string} [voterAddress] - The Stacks address of the voter to check (defaults to connected user).
   * @returns {Promise<boolean>} True if the voter has voted, false otherwise.
   */
  const hasVoted = useCallback(async (electionId: number, voterAddress?: string): Promise<boolean> => {
    const addressToCheck = voterAddress || getSenderAddress();
    if (!addressToCheck) return false; // Cannot check if voter address is unknown

    const options = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'has-voted',
      functionArgs: [uintCV(electionId), principalCV(addressToCheck)],
      network: getNetwork(),
      senderAddress: getSenderAddress(), // Can be different from voterAddress being checked
    };
    try {
      const result = await callReadOnlyFunction(options);
      return cvToValue(result); // Returns boolean
    } catch (error) {
      console.error(`Error checking vote status for ${addressToCheck} in election ${electionId}:`, error);
      throw new Error('Failed to check vote status.');
    }
  }, [getNetwork, getSenderAddress]);

  // --- Public Functions (Contract Calls requiring Wallet Signature) --- //

  /**
   * Initiates a contract call transaction to create a new election.
   * Requires the user to be signed in.
   * @param {string} question - The election question.
   * @param {number} startBlock - The starting block height.
   * @param {number} endBlock - The ending block height.
   * @param {string[]} optionsList - The list of voting options.
   * @param {object} callbacks - Optional callbacks for transaction finish/cancel.
   * @param {function} [callbacks.onFinish] - Called when the transaction is broadcast.
   * @param {function} [callbacks.onCancel] - Called if the user cancels the transaction.
   */
  const createElection = useCallback(async (
    question: string,
    startBlock: number,
    endBlock: number,
    optionsList: string[],
    callbacks: { onFinish?: (data: any) => void; onCancel?: () => void }
  ) => {
    if (!userSession || !userSession.isUserSignedIn()) {
      throw new Error('User must be signed in to create an election.');
    }

    const functionArgs = [
      stringUtf8CV(question),
      uintCV(startBlock),
      uintCV(endBlock),
      listCV(optionsList.map(opt => stringUtf8CV(opt))),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'create-election',
      functionArgs,
      network: getNetwork(),
      appDetails: { name: APP_NAME, icon: APP_ICON },
      onFinish: callbacks.onFinish,
      onCancel: callbacks.onCancel,
    };

    await openContractCall(txOptions);
  }, [userSession, getNetwork]); // Depend on getNetwork

  /**
   * Initiates a contract call transaction to cast a vote.
   * Requires the user to be signed in.
   * @param {number} electionId - The ID of the election to vote in.
   * @param {number} optionIndex - The index of the chosen option.
   * @param {object} callbacks - Optional callbacks for transaction finish/cancel.
   * @param {function} [callbacks.onFinish] - Called when the transaction is broadcast.
   * @param {function} [callbacks.onCancel] - Called if the user cancels the transaction.
   */
  const castVote = useCallback(async (
    electionId: number,
    optionIndex: number,
    callbacks: { onFinish?: (data: any) => void; onCancel?: () => void }
  ) => {
    if (!userSession || !userSession.isUserSignedIn()) {
      throw new Error('User must be signed in to vote.');
    }

    const functionArgs = [
      uintCV(electionId),
      uintCV(optionIndex),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'cast-vote',
      functionArgs,
      network: getNetwork(),
      appDetails: { name: APP_NAME, icon: APP_ICON },
      onFinish: callbacks.onFinish,
      onCancel: callbacks.onCancel,
    };

    await openContractCall(txOptions);
  }, [userSession, getNetwork]); // Depend on getNetwork

  // Return the set of functions for interacting with the contract
  return {
    getElectionCount,
    getElectionDetails,
    getElectionResults,
    hasVoted,
    createElection,
    castVote,
  };
};

