import React, { useState, useEffect } from 'react';
import { Airline, Feature, Implementation, CreateImplementationRequest } from '../types';

interface ImplementationMatrixProps {
  airlines: Airline[];
  features: Feature[];
  implementations: Implementation[];
  onUpdateImplementation: (id: number, data: Partial<CreateImplementationRequest>) => Promise<void>;
  onCreateImplementation: (data: CreateImplementationRequest) => Promise<void>;
  isLoading?: boolean;
}

export const ImplementationMatrix: React.FC<ImplementationMatrixProps> = ({
  airlines,
  features,
  implementations,
  onUpdateImplementation,
  onCreateImplementation,
  isLoading = false,
}) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [cellValues, setCellValues] = useState<Record<string, string>>({});
  const [cellNotes, setCellNotes] = useState<Record<string, string>>({});

  // Create a map for quick lookup of implementations
  const implementationMap = implementations.reduce((acc, impl) => {
    const key = `${impl.airline_id}-${impl.feature_id}`;
    acc[key] = impl;
    return acc;
  }, {} as Record<string, Implementation>);

  useEffect(() => {
    // Initialize cell values from implementations
    const values: Record<string, string> = {};
    const notes: Record<string, string> = {};
    
    implementations.forEach(impl => {
      const key = `${impl.airline_id}-${impl.feature_id}`;
      values[key] = impl.value;
      notes[key] = impl.notes || '';
    });
    
    setCellValues(values);
    setCellNotes(notes);
  }, [implementations]);

  const getCellKey = (airlineId: number, featureId: number) => `${airlineId}-${featureId}`;

  const getImplementation = (airlineId: number, featureId: number): Implementation | undefined => {
    const key = getCellKey(airlineId, featureId);
    return implementationMap[key];
  };

  const handleCellClick = (airlineId: number, featureId: number) => {
    const key = getCellKey(airlineId, featureId);
    setEditingCell(key);
  };

  const handleCellSave = async (airlineId: number, featureId: number) => {
    const key = getCellKey(airlineId, featureId);
    const value = cellValues[key] || '';
    const notes = cellNotes[key] || '';
    
    if (!value.trim()) {
      alert('Implementation value is required');
      return;
    }

    try {
      const existingImpl = getImplementation(airlineId, featureId);
      
      if (existingImpl) {
        // Update existing implementation
        await onUpdateImplementation(existingImpl.id, { value, notes });
      } else {
        // Create new implementation
        await onCreateImplementation({
          airline_id: airlineId,
          feature_id: featureId,
          value,
          notes,
        });
      }
      
      setEditingCell(null);
    } catch (error) {
      console.error('Failed to save implementation:', error);
      alert('Failed to save implementation. Please try again.');
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    // Reset values to original
    const values: Record<string, string> = {};
    const notes: Record<string, string> = {};
    
    implementations.forEach(impl => {
      const key = `${impl.airline_id}-${impl.feature_id}`;
      values[key] = impl.value;
      notes[key] = impl.notes || '';
    });
    
    setCellValues(values);
    setCellNotes(notes);
  };

  const handleValueChange = (key: string, value: string) => {
    setCellValues(prev => ({ ...prev, [key]: value }));
  };

  const handleNotesChange = (key: string, notes: string) => {
    setCellNotes(prev => ({ ...prev, [key]: notes }));
  };

  const getStatusClass = (value: string): string => {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'yes') return 'status-yes';
    if (lowerValue === 'no') return 'status-no';
    if (lowerValue === 'limited') return 'status-limited';
    if (lowerValue === 'pilot') return 'status-pilot';
    return 'status-other';
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading implementation matrix...</p>
      </div>
    );
  }

  return (
    <div className="implementation-matrix">
      <div className="matrix-container">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="feature-header">Features</th>
              {airlines.map(airline => (
                <th key={airline.id} className="airline-header">
                  <div className="airline-header-content">
                    <div className="airline-name">{airline.name}</div>
                    <div className="airline-codes">{airline.codes}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map(feature => (
              <tr key={feature.id}>
                <td className="feature-cell">
                  <div className="feature-info">
                    <div className="feature-name">{feature.name}</div>
                    <div className="feature-category">{feature.category}</div>
                  </div>
                </td>
                {airlines.map(airline => {
                  const key = getCellKey(airline.id, feature.id);
                  const isEditing = editingCell === key;
                  const value = cellValues[key] || '';
                  const notes = cellNotes[key] || '';

                  return (
                    <td key={`${airline.id}-${feature.id}`} className="implementation-cell">
                      {isEditing ? (
                        <div className="cell-editor">
                          <select
                            value={value}
                            onChange={(e) => handleValueChange(key, e.target.value)}
                            className="value-select"
                          >
                            <option value="">Select...</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Limited">Limited</option>
                            <option value="Pilot">Pilot</option>
                            <option value="Planned">Planned</option>
                          </select>
                          <textarea
                            value={notes}
                            onChange={(e) => handleNotesChange(key, e.target.value)}
                            placeholder="Notes (optional)"
                            className="notes-input"
                            rows={2}
                          />
                          <div className="cell-actions">
                            <button
                              onClick={() => handleCellSave(airline.id, feature.id)}
                              className="btn btn-sm btn-primary"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCellCancel}
                              className="btn btn-sm btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className={`cell-content ${getStatusClass(value)}`}
                          onClick={() => handleCellClick(airline.id, feature.id)}
                          title={notes ? `${value} - ${notes}` : value}
                        >
                          <div className="cell-value">{value || '-'}</div>
                          {notes && (
                            <div className="cell-notes-indicator">📝</div>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="matrix-legend">
        <h4>Legend:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color status-yes"></span>
            <span>Yes - Fully supported</span>
          </div>
          <div className="legend-item">
            <span className="legend-color status-limited"></span>
            <span>Limited - Partial support</span>
          </div>
          <div className="legend-item">
            <span className="legend-color status-pilot"></span>
            <span>Pilot - Testing phase</span>
          </div>
          <div className="legend-item">
            <span className="legend-color status-no"></span>
            <span>No - Not supported</span>
          </div>
        </div>
        <p className="matrix-help">
          Click on any cell to edit the implementation status and add notes.
        </p>
      </div>
    </div>
  );
};