// __mocks__/AuthContextMock.tsx
import React, { createContext, useContext } from 'react';
import { UserSession } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';

// Define a simplified context type for mocking
interface MockAuthContextType {
  userSession: Partial<UserSession>;
  userData: any | null;
  network: StacksTestnet;
  connectWallet: jest.Mock;
  disconnectWallet: jest.Mock;
  isConnecting: boolean;
}

// Create a mock context
const MockAuthContext = createContext<MockAuthContextType | null>(null);

// Mock provider component
export const MockAuthProvider: React.FC<{
  children: React.ReactNode;
  mockValues?: Partial<MockAuthContextType>;
}> = ({ children, mockValues }) => {
  const defaultValues: MockAuthContextType = {
    userSession: { // Provide mock implementations or partials as needed
      isUserSignedIn: jest.fn(() => !!mockValues?.userData),
      loadUserData: jest.fn(() => mockValues?.userData || null),
      signUserOut: jest.fn(),
    },
    userData: null,
    network: new StacksTestnet(),
    connectWallet: jest.fn(),
    disconnectWallet: jest.fn(),
    isConnecting: false,
    ...mockValues,
  };

  return (
    <MockAuthContext.Provider value={defaultValues}>
      {children}
    </MockAuthContext.Provider>
  );
};

// Hook to use the mock context
export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};

// Re-export useAuth to point to the mock implementation for tests
export const useAuth = useMockAuth;

