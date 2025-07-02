import React, { useState, useEffect } from 'react';
import { Airline, CreateAirlineRequest, UpdateAirlineRequest, LoadingState } from '../types';
import { airlinesAPI } from '../services/api';
import { AirlineList } from '../components/AirlineList';
import { AirlineForm } from '../components/AirlineForm';

type ViewMode = 'list' | 'add' | 'edit' | 'view';

export const AirlinesPage: React.FC = () => {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [currentAirline, setCurrentAirline] = useState<Airline | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load airlines on component mount
  useEffect(() => {
    loadAirlines();
  }, []);

  const loadAirlines = async () => {
    try {
      setLoadingState({ isLoading: true });
      const airlinesData = await airlinesAPI.getAll();
      setAirlines(airlinesData);
      setLoadingState({ isLoading: false });
    } catch (error) {
      setLoadingState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load airlines',
      });
    }
  };

  const handleCreateAirline = async (airlineData: CreateAirlineRequest) => {
    setIsSubmitting(true);
    try {
      const newAirline = await airlinesAPI.create(airlineData);
      setAirlines(prev => [...prev, newAirline]);
      setViewMode('list');
      // Show success message (you could add a toast notification here)
      console.log('Airline created successfully');
    } catch (error) {
      console.error('Failed to create airline:', error);
      throw error; // Re-throw to let form handle the error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAirline = async (airlineData: UpdateAirlineRequest) => {
    if (!currentAirline) return;

    setIsSubmitting(true);
    try {
      const updatedAirline = await airlinesAPI.update(currentAirline.id, airlineData);
      setAirlines(prev =>
        prev.map(airline =>
          airline.id === currentAirline.id ? updatedAirline : airline
        )
      );
      setViewMode('list');
      setCurrentAirline(null);
      console.log('Airline updated successfully');
    } catch (error) {
      console.error('Failed to update airline:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAirline = async (airline: Airline) => {
    if (!window.confirm(`Are you sure you want to delete ${airline.name}?`)) {
      return;
    }

    try {
      await airlinesAPI.delete(airline.id);
      setAirlines(prev => prev.filter(a => a.id !== airline.id));
      console.log('Airline deleted successfully');
    } catch (error) {
      console.error('Failed to delete airline:', error);
      alert('Failed to delete airline. Please try again.');
    }
  };

  const handleViewAirline = (airline: Airline) => {
    setCurrentAirline(airline);
    setViewMode('view');
  };

  const handleEditAirline = (airline: Airline) => {
    setCurrentAirline(airline);
    setViewMode('edit');
  };

  const handleAddNew = () => {
    setCurrentAirline(null);
    setViewMode('add');
  };

  const handleCancel = () => {
    setCurrentAirline(null);
    setViewMode('list');
  };

  const renderContent = () => {
    if (loadingState.error) {
      return (
        <div className="error-container">
          <h3>Error Loading Airlines</h3>
          <p>{loadingState.error}</p>
          <button onClick={loadAirlines} className="btn btn-primary">
            Try Again
          </button>
        </div>
      );
    }

    switch (viewMode) {
      case 'add':
        return (
          <AirlineForm
            onSubmit={handleCreateAirline}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        );

      case 'edit':
        return (
          <AirlineForm
            airline={currentAirline!}
            onSubmit={handleUpdateAirline}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        );

      case 'view':
        return (
          <div className="airline-details">
            <div className="details-header">
              <h2>{currentAirline?.name}</h2>
              <div className="details-actions">
                <button
                  onClick={() => handleEditAirline(currentAirline!)}
                  className="btn btn-primary"
                >
                  Edit
                </button>
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  Back to List
                </button>
              </div>
            </div>

            <div className="details-content">
              <div className="detail-item">
                <label>Name:</label>
                <span>{currentAirline?.name}</span>
              </div>
              <div className="detail-item">
                <label>Codes:</label>
                <span>{currentAirline?.codes}</span>
              </div>
              <div className="detail-item">
                <label>Provider:</label>
                <span>{currentAirline?.provider}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className={`status-badge status-${currentAirline?.status.toLowerCase()}`}>
                  {currentAirline?.status}
                </span>
              </div>
              <div className="detail-item">
                <label>Created:</label>
                <span>{currentAirline ? new Date(currentAirline.created_at).toLocaleDateString() : ''}</span>
              </div>
              <div className="detail-item">
                <label>Last Updated:</label>
                <span>{currentAirline ? new Date(currentAirline.updated_at).toLocaleDateString() : ''}</span>
              </div>
            </div>
          </div>
        );

      case 'list':
      default:
        return (
          <AirlineList
            airlines={airlines}
            onEdit={handleEditAirline}
            onDelete={handleDeleteAirline}
            onView={handleViewAirline}
            isLoading={loadingState.isLoading}
          />
        );
    }
  };

  return (
    <div className="airlines-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Airlines Management</h1>
          <p>Manage airline information and configurations</p>
        </div>

        {viewMode === 'list' && (
          <div className="page-actions">
            <button
              onClick={handleAddNew}
              className="btn btn-primary"
            >
              + Add New Airline
            </button>
            <button
              onClick={loadAirlines}
              className="btn btn-secondary"
              disabled={loadingState.isLoading}
            >
              🔄 Refresh
            </button>
          </div>
        )}
      </div>

      <div className="page-content">
        {renderContent()}
      </div>
    </div>
  );
};