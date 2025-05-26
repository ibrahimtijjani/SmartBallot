import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import CreateElectionPage from './pages/CreateElectionPage';
import ElectionDetailsPage from './pages/ElectionDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateElectionPage />} />
          <Route path="/election/:electionId" element={<ElectionDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {/* Optional Footer can be added here */}
      {/* <footer className="bg-gray-200 p-4 text-center text-sm text-gray-600">
        Decentralized Voting Platform &copy; 2025
      </footer> */}
    </div>
  );
};

export default App;

