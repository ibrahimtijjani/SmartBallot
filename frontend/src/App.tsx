import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import CreateElectionPage from './pages/CreateElectionPage';
import ElectionDetailsPage from './pages/ElectionDetailsPage';
import UserDashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateElectionPage />} />
            <Route path="/dashboard" element={<UserDashboardPage />} />
            <Route path="/election/:electionId" element={<ElectionDetailsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-dark-800 text-white py-6 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-center sm:text-left mb-2 sm:mb-0">
              <p className="text-sm text-gray-300 dark:text-gray-400">
                Decentralized Voting Platform &copy; 2025
              </p>
            </div>
            <div className="flex space-x-4 text-sm">
              <a 
                href="#" 
                className="text-gray-300 dark:text-gray-400 hover:text-white transition duration-300"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="text-gray-300 dark:text-gray-400 hover:text-white transition duration-300"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

