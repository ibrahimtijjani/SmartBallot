import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StacksTestnet } from '@stacks/network';
import { openContractCall } from '@stacks/connect';
import { stringUtf8CV, uintCV, listCV } from '@stacks/transactions';
import { useFormValidation } from '../hooks/useFormValidation';
import { CONTRACT_ADDRESS, CONTRACT_NAME, APP_NAME, APP_ICON } from '../lib/constants';
import type { ElectionFormData } from '../utils/validation';

const CreateElectionPage: React.FC = () => {
  const { network, userData } = useAuth();
  const { errors, validateForm, validateField, sanitizeAndSet } = useFormValidation();
  
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
    const sanitizedValue = sanitizeAndSet(value);
    const newOptions = [...options];
    newOptions[index] = sanitizedValue;
    setOptions(newOptions);
    
    // Validate options in real-time
    validateField('options', newOptions);
  };

  const handleQuestionChange = (value: string) => {
    const sanitizedValue = sanitizeAndSet(value);
    setQuestion(sanitizedValue);
    
    // Validate question in real-time
    validateField('question', sanitizedValue);
  };

  const handleStartBlockOffsetChange = (value: number) => {
    setStartBlockOffset(value);
    validateField('startBlockOffset', value);
  };

  const handleDurationChange = (value: number) => {
    setDuration(value);
    validateField('duration', value);
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

    // Validate entire form
    const formData: ElectionFormData = {
      question,
      options,
      startBlockOffset,
      duration
    };

    const isValid = validateForm(formData);
    if (!isValid) {
      setError('Please fix the validation errors before submitting.');
      setIsLoading(false);
      return;
    }

    const filteredOptions = options.filter(opt => opt.trim() !== '');

    // TODO: Get current block height more reliably
    const currentBlockHeight = 100000; // Placeholder - fetch actual block height
    const startBlock = currentBlockHeight + startBlockOffset;
    const endBlock = startBlock + duration;

    const functionArgs = [
      stringUtf8CV(question),
      uintCV(startBlock),
      uintCV(endBlock),
      listCV(filteredOptions.map(opt => stringUtf8CV(opt))),
    ];    const optionsPayload = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'create-election',
      functionArgs,
      network: network || new StacksTestnet(), // Ensure network is defined
      appDetails: {
        name: APP_NAME,
        icon: APP_ICON,
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
    <div className="max-w-4xl mx-auto">      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Election
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          Set up a new decentralized voting election on the blockchain
        </p>
      </div>
      
      <form 
        onSubmit={handleSubmit} 
        className="bg-white dark:bg-dark-800 rounded-lg shadow-lg overflow-hidden border dark:border-dark-700"
      >
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">        <div className="mb-4">
          <label htmlFor="question" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Election Question</label>
          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => handleQuestionChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-dark-700 text-gray-900 dark:text-white ${
              errors.question 
                ? 'border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
            }`}
            maxLength={256}
            required
          />
          {errors.question && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.question}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {question.length}/256 characters
          </p>
        </div><div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Voting Options</label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 mr-2 transition-colors ${
                  errors.options 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                maxLength={64}
                placeholder={`Option ${index + 1}`}
                required
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {errors.options && errors.options.length > 0 && (
            <p className="text-red-500 text-sm mb-2">{errors.options[0]}</p>
          )}
          {options.length < 10 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-2 text-blue-600 hover:underline text-sm"
            >
              + Add Option
            </button>
          )}
        </div>        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          <div>
            <label htmlFor="startBlockOffset" className="block text-gray-700 font-semibold mb-2">Start Delay (Blocks)</label>
            <input
              type="number"
              id="startBlockOffset"
              value={startBlockOffset}
              onChange={(e) => handleStartBlockOffsetChange(parseInt(e.target.value, 10) || 0)}
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                errors.startBlockOffset 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
            />
            {errors.startBlockOffset && (
              <p className="text-red-500 text-sm mt-1">{errors.startBlockOffset}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Election starts this many blocks after creation.</p>
          </div>
          <div>
            <label htmlFor="duration" className="block text-gray-700 font-semibold mb-2">Duration (Blocks)</label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => handleDurationChange(parseInt(e.target.value, 10) || 1)}
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                errors.duration 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
            />
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">How many blocks the election will remain open.</p>
          </div>
        </div>        {(error || successTxId) && (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {successTxId && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Success!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Election created successfully!</p>
                      <p className="font-mono text-xs break-all mt-1">
                        Transaction ID: {successTxId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="submit"
            disabled={isLoading || !userData}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Election...
              </>
            ) : (
              'Create Election'
            )}
          </button>
          {!userData && (
            <p className="mt-2 sm:mt-0 sm:mr-3 text-red-500 text-sm">
              Please connect your wallet to create an election.
            </p>
          )}
        </div>
        </div>
      </form>
    </div>
  );
};

export default CreateElectionPage;

