import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import { useElections } from '../hooks/useElections';
import { useAuth } from '../contexts/AuthContext';

// Mock the hooks
jest.mock('../hooks/useElections');
jest.mock('../contexts/AuthContext');

describe('HomePage', () => {
  beforeEach(() => {
    // Reset mocks
    (useElections as jest.Mock).mockReset();
    (useAuth as jest.Mock).mockReset();
  });

  test('renders loading state', () => {
    (useElections as jest.Mock).mockReturnValue({
      elections: [],
      loading: true,
      error: null,
    });
    
    (useAuth as jest.Mock).mockReturnValue({
      userData: null,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Check if loading spinner is visible
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('renders error state', () => {
    (useElections as jest.Mock).mockReturnValue({
      elections: [],
      loading: false,
      error: 'Failed to load elections',
    });
    
    (useAuth as jest.Mock).mockReturnValue({
      userData: null,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Check if error message is displayed
    expect(screen.getByText(/Failed to load elections/i)).toBeInTheDocument();
  });

  test('renders empty state when no elections', () => {
    (useElections as jest.Mock).mockReturnValue({
      elections: [],
      loading: false,
      error: null,
    });
    
    (useAuth as jest.Mock).mockReturnValue({
      userData: null,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Check if empty state message is displayed
    expect(screen.getByText(/No elections found/i)).toBeInTheDocument();
    expect(screen.getByText(/Be the first to create an election!/i)).toBeInTheDocument();
  });

  test('renders elections when available', () => {
    const mockElections = [
      {
        id: 1,
        creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        question: 'Test Question 1',
        options: ['Option 1', 'Option 2'],
        startBlock: 100,
        endBlock: 200,
        isActive: true,
        hasEnded: false,
        totalVotes: 5,
      },
      {
        id: 2,
        creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        question: 'Test Question 2',
        options: ['Option A', 'Option B', 'Option C'],
        startBlock: 50,
        endBlock: 150,
        isActive: false,
        hasEnded: true,
        totalVotes: 10,
      },
    ];
    
    (useElections as jest.Mock).mockReturnValue({
      elections: mockElections,
      loading: false,
      error: null,
    });
    
    (useAuth as jest.Mock).mockReturnValue({
      userData: null,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Check if elections are displayed
    expect(screen.getByText('Test Question 1')).toBeInTheDocument();
    expect(screen.getByText('Test Question 2')).toBeInTheDocument();
    expect(screen.getByText('Options: 2')).toBeInTheDocument();
    expect(screen.getByText('Options: 3')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Ended')).toBeInTheDocument();
    expect(screen.getByText('Votes: 5')).toBeInTheDocument();
    expect(screen.getByText('Votes: 10')).toBeInTheDocument();
  });

  test('shows create button when user is logged in', () => {
    (useElections as jest.Mock).mockReturnValue({
      elections: [],
      loading: false,
      error: null,
    });
    
    (useAuth as jest.Mock).mockReturnValue({
      userData: { profile: { stxAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' } },
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Check if create button is displayed
    expect(screen.getByText('Create New Election')).toBeInTheDocument();
  });
});