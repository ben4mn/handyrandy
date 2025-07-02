import React from 'react';
import { Airline } from '../types';

interface AirlineListProps {
  airlines: Airline[];
  onEdit: (airline: Airline) => void;
  onDelete: (airline: Airline) => void;
  onView: (airline: Airline) => void;
  isLoading?: boolean;
}

export const AirlineList: React.FC<AirlineListProps> = ({
  airlines,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Production':
        return 'status-badge status-production';
      case 'Pilot':
        return 'status-badge status-pilot';
      case 'Development':
        return 'status-badge status-development';
      case 'Inactive':
        return 'status-badge status-inactive';
      default:
        return 'status-badge';
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading airlines...</p>
      </div>
    );
  }

  if (airlines.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Airlines Found</h3>
        <p>Get started by adding your first airline.</p>
      </div>
    );
  }

  return (
    <div className="airline-list">
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Codes</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {airlines.map((airline) => (
              <tr key={airline.id}>
                <td>
                  <div className="airline-name">
                    <strong>{airline.name}</strong>
                  </div>
                </td>
                <td>
                  <span className="airline-codes">{airline.codes}</span>
                </td>
                <td>{airline.provider}</td>
                <td>
                  <span className={getStatusBadgeClass(airline.status)}>
                    {airline.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => onView(airline)}
                      className="btn btn-sm btn-info"
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => onEdit(airline)}
                      className="btn btn-sm btn-primary"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(airline)}
                      className="btn btn-sm btn-danger"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p className="table-count">
          Showing {airlines.length} airline{airlines.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};