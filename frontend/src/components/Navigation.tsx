import React, { useState } from 'react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  apiStatus: 'online' | 'offline' | 'checking';
  isNavOpen: boolean;
  onToggleNav: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  onNavigate, 
  apiStatus, 
  isNavOpen, 
  onToggleNav 
}) => {
  const navItems = [
    { id: 'airlines', label: 'Airlines', icon: '✈️' },
    { id: 'features', label: 'Features', icon: '🔧' },
    { id: 'matrix', label: 'Implementation Matrix', icon: '📊' },
    { id: 'chat', label: 'AI Chat', icon: '💬' },
  ];

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'online': return '✅';
      case 'offline': return '❌';
      case 'checking': return '🔄';
      default: return '❓';
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'online': return 'API Connected';
      case 'offline': return 'API Offline';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        {/* Brand */}
        <div className="nav-brand">
          <div className="nav-brand-icon">NDC</div>
          <span>Features Manager</span>
        </div>

        {/* Desktop Navigation */}
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
              >
                <span className="nav-link-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* API Status */}
        <div className={`service-status ${apiStatus}`} style={{ margin: 0, padding: '8px 12px' }}>
          <span className="status-icon">{getStatusIcon()}</span>
          <span style={{ fontSize: '12px' }}>{getStatusText()}</span>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="nav-mobile-toggle"
          onClick={onToggleNav}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`nav-mobile-menu ${isNavOpen ? 'open' : ''}`}>
        <ul className="nav-mobile-links">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
              >
                <span className="nav-link-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};