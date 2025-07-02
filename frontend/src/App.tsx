import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { AirlinesPage } from './pages/AirlinesPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { ImplementationMatrixPage } from './pages/ImplementationMatrixPage';
import { ChatPage } from './pages/ChatPage';
import { healthCheck } from './services/api';
import './styles/navigation.css';
import './styles/components.css';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('airlines');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    checkApiHealth();
    // Check API health every 30 seconds
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkApiHealth = async () => {
    try {
      const isHealthy = await healthCheck();
      setApiStatus(isHealthy ? 'online' : 'offline');
    } catch (error) {
      setApiStatus('offline');
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setIsNavOpen(false); // Close nav on mobile after navigation
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'airlines':
        return <AirlinesPage />;
      case 'features':
        return <FeaturesPage />;
      case 'matrix':
        return <ImplementationMatrixPage />;
      case 'chat':
        return <ChatPage />;
      default:
        return <AirlinesPage />;
    }
  };

  return (
    <div className="App">
      {/* Navigation */}
      <Navigation 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        apiStatus={apiStatus}
        isNavOpen={isNavOpen}
        onToggleNav={toggleNav}
      />

      {/* Main Content */}
      <main className="main-container">
        {currentPage !== 'chat' && (
          <div className="page-content">
            {renderCurrentPage()}
          </div>
        )}
        {currentPage === 'chat' && renderCurrentPage()}
      </main>

      {/* Mobile nav overlay */}
      {isNavOpen && (
        <div 
          className="nav-overlay"
          onClick={() => setIsNavOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
        />
      )}
    </div>
  );
}

export default App;
