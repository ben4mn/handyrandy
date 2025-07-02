import React from 'react';
import { Feature } from '../types';

interface FeatureListProps {
  features: Feature[];
  onEdit: (feature: Feature) => void;
  onDelete: (feature: Feature) => void;
  onView: (feature: Feature) => void;
  isLoading?: boolean;
}

export const FeatureList: React.FC<FeatureListProps> = ({
  features,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading features...</p>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Features Found</h3>
        <p>Add your first feature to get started with managing NDC capabilities.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Feature Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr key={feature.id}>
              <td>
                <div className="feature-name">
                  <strong>{feature.name}</strong>
                </div>
              </td>
              <td>
                <span className="feature-category">{feature.category}</span>
              </td>
              <td>
                <div className="feature-description">
                  {feature.description && feature.description.length > 80 
                    ? `${feature.description.substring(0, 80)}...` 
                    : feature.description || '-'}
                </div>
              </td>
              <td>
                {new Date(feature.created_at).toLocaleDateString()}
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    onClick={() => onView(feature)}
                    className="btn btn-sm btn-info"
                    title="View details"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => onEdit(feature)}
                    className="btn btn-sm btn-secondary"
                    title="Edit feature"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(feature)}
                    className="btn btn-sm btn-danger"
                    title="Delete feature"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="table-footer">
        <p className="table-count">
          Showing {features.length} feature{features.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};