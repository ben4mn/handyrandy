import React from 'react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'airlines', label: 'Airlines', icon: '✈️' },
    { id: 'features', label: 'Features', icon: '🔧' },
    { id: 'matrix', label: 'Implementation Matrix', icon: '📊' },
    { id: 'chat', label: 'AI Chat', icon: '💬' },
  ];

  return (
    <nav className="navigation">
      <div className="nav-header">
        <h1 className="nav-title">
          <span className="nav-icon">🛩️</span>
          NDC Features
        </h1>
        <p className="nav-subtitle">Airline Feature Management</p>
      </div>

      <ul className="nav-menu">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onNavigate(item.id)}
              className={`nav-item ${currentPage === item.id ? 'nav-item-active' : ''}`}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="nav-footer">
        <div className="nav-status">
          <div className="status-indicator status-online"></div>
          <span>API Connected</span>
        </div>
      </div>
    </nav>
  );
};