import { useState, useEffect } from 'react';
import { callReadOnlyFunction } from '@stacks/transactions';
import { StacksNetwork } from '@stacks/network';
import { useAuth } from '../contexts/AuthContext';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../lib/constants';

export interface Election {
  id: number;
  creator: string;
  question: string;
  options: string[];
  startBlock: number;
  endBlock: number;
  isActive: boolean;
  hasEnded: boolean;
  totalVotes: number;
}

export function useElections() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { network } = useAuth();

  const fetchElections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the get-election-count function
      const countResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-election-count',
        functionArgs: [],
        network: network as StacksNetwork,
      });
      
      const count = Number(countResult.value);
      const electionPromises = [];
      
      // Fetch each election by ID
      for (let i = 0; i < count; i++) {
        electionPromises.push(fetchElection(i, network as StacksNetwork));
      }
      
      const fetchedElections = await Promise.all(electionPromises);
      setElections(fetchedElections);
    } catch (err) {
      console.error('Error fetching elections:', err);
      setError('Failed to load elections. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchElection = async (id: number, network: StacksNetwork): Promise<Election> => {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-election',
      functionArgs: [uintCV(id)],
      network,
    });
    
    // Parse the result from the contract
    const electionData = result.value;
    return {
      id,
      creator: electionData.creator.value,
      question: electionData.question.value,
      options: electionData.options.list.map((opt: any) => opt.value),
      startBlock: Number(electionData.startBlock.value),
      endBlock: Number(electionData.endBlock.value),
      isActive: Boolean(electionData.isActive.value),
      hasEnded: Boolean(electionData.hasEnded.value),
      totalVotes: Number(electionData.totalVotes.value),
    };
  };

  useEffect(() => {
    if (network) {
      fetchElections();
    }
  }, [network]);

  return { elections, loading, error, fetchElections };
}