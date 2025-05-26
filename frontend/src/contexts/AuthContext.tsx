import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { NETWORK, APP_NAME, APP_ICON } from '../lib/constants'; // Import constants

// Define the shape of the authentication context data
interface AuthContextType {
  userSession: UserSession;
  userData: any | null; // Type for user data provided by @stacks/connect
  network: StacksMainnet | StacksTestnet;
  connectWallet: () => void;
  disconnectWallet: () => void;
  isConnecting: boolean;
}

// Create the React Context
const AuthContext = createContext<AuthContextType | null>(null);

// Configure the application for Stacks connection
const appConfig = new AppConfig(['store_write', 'publish_data']);

// Create a single UserSession instance for the application
export const userSession = new UserSession({ appConfig });

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provides authentication state and actions related to Stacks wallet connection.
 * Manages user session and data, network configuration, and connection status.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<any | null>(null);
  const [isConnecting, setIsConnecting] = useState(true); // Start as true until session is loaded

  // Determine the Stacks network instance based on configuration
  const network = useMemo(() => {
    return NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
  }, []);

  // Callback function to initiate wallet connection
  const connectWallet = useCallback(() => {
    setIsConnecting(true);
    showConnect({
      appDetails: {
        name: APP_NAME,
        icon: APP_ICON,
      },
      redirectTo: '/',
      onFinish: () => {
        // Reload user data after connection attempt
        setUserData(userSession.loadUserData());
        setIsConnecting(false);
      },
      onCancel: () => {
        console.log('Connection cancelled by user.');
        setIsConnecting(false);
      },
      userSession,
    });
  }, []);

  // Callback function to disconnect the wallet
  const disconnectWallet = useCallback(() => {
    if (userSession.isUserSignedIn()) {
      userSession.signUserOut('/');
      setUserData(null);
    }
  }, []);

  // Effect to handle initial authentication state check on component mount
  useEffect(() => {
    setIsConnecting(true);
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((loadedUserData) => {
        setUserData(loadedUserData);
        setIsConnecting(false);
      }).catch(err => {
        console.error('Error handling pending sign in:', err);
        setIsConnecting(false);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
      setIsConnecting(false);
    } else {
      // Not signed in and no pending sign in
      setIsConnecting(false);
    }
  }, []);

  // Provide the authentication context value to children components
  return (
    <AuthContext.Provider value={{ userSession, userData, network, connectWallet, disconnectWallet, isConnecting }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to easily access the authentication context.
 * Throws an error if used outside of an AuthProvider.
 * @returns {AuthContextType} The authentication context values.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

