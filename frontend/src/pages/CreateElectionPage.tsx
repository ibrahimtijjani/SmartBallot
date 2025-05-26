import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StacksTestnet } from '@stacks/network';
import { openContractCall } from '@stacks/connect';
import { standardPrincipalCV, stringUtf8CV, uintCV, listCV } from '@stacks/transactions';

// TODO: Get these from .env or context
const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Replace with actual deployed address
const contractName = 'voting';

const CreateElectionPage: React.FC = () => {
  const { network, userData } = useAuth();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']); // Start with two empty options
  const [startBlockOffset, setStartBlockOffset] = useState<number>(10); // Start ~10 blocks from now
  const [duration, setDuration] = useState<number>(100); // Duration in blocks (e.g., ~1 day on mainnet)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTxId, setSuccessTxId] = useState<string | null>(null);

  const handleAddOption = () => {
    if (options.length < 10) { // Match MAX_OPTIONS in contract
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) { // Keep at least two options
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessTxId(null);
    setIsLoading(true);

    if (!userData) {
      setError('Please connect your wallet first.');
      setIsLoading(false);
      return;
    }

    const filteredOptions = options.filter(opt => opt.trim() !== '');
    if (question.trim() === '' || filteredOptions.length < 2) {
      setError('Please provide a question and at least two non-empty options.');
      setIsLoading(false);
      return;
    }

    // TODO: Get current block height more reliably
    const currentBlockHeight = 100000; // Placeholder - fetch actual block height
    const startBlock = currentBlockHeight + startBlockOffset;
    const endBlock = startBlock + duration;

    const functionArgs = [
      stringUtf8CV(question),
      uintCV(startBlock),
      uintCV(endBlock),
      listCV(filteredOptions.map(opt => stringUtf8CV(opt))),
    ];

    const optionsPayload = {
      contractAddress,
      contractName,
      functionName: 'create-election',
      functionArgs,
      network: network || new StacksTestnet(), // Ensure network is defined
      appDetails: {
        name: 'Decentralized Voting Platform',
        icon: window.location.origin + '/favicon.ico',
      },
      onFinish: (data: any) => {
        console.log('Transaction finished:', data);
        setSuccessTxId(data.txId);
        setIsLoading(false);
        // Optionally clear form or redirect
      },
      onCancel: () => {
        console.log('Transaction cancelled');
        setError('Transaction cancelled by user.');
        setIsLoading(false);
      },
    };

    try {
      await openContractCall(optionsPayload);
    } catch (err) {
      console.error('Error opening contract call:', err);
      setError('Failed to initiate transaction. See console for details.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Election</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <div className="mb-4">
          <label htmlFor="question" className="block text-gray-700 font-semibold mb-2">Election Question</label>
          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={256}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Voting Options</label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                maxLength={64}
                required
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {options.length < 10 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-2 text-blue-600 hover:underline text-sm"
            >
              + Add Option
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="startBlockOffset" className="block text-gray-700 font-semibold mb-2">Start Delay (Blocks)</label>
            <input
              type="number"
              id="startBlockOffset"
              value={startBlockOffset}
              onChange={(e) => setStartBlockOffset(parseInt(e.target.value, 10) || 0)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Election starts this many blocks after creation.</p>
          </div>
          <div>
            <label htmlFor="duration" className="block text-gray-700 font-semibold mb-2">Duration (Blocks)</label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10) || 1)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
             <p className="text-xs text-gray-500 mt-1">How many blocks the election will remain open.</p>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">Error: {error}</p>}
        {successTxId && <p className="text-green-600 mb-4">Success! Transaction ID: {successTxId}</p>}

        <button
          type="submit"
          disabled={isLoading || !userData}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Election...' : 'Create Election'}
        </button>
        {!userData && <p className="text-red-500 text-sm mt-2">Please connect your wallet to create an election.</p>}
      </form>
    </div>
  );
};

export default CreateElectionPage;

