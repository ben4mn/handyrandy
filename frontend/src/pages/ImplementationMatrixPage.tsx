import React, { useState, useEffect } from 'react';
import { Airline, Feature, Implementation, CreateImplementationRequest, LoadingState } from '../types';
import { airlinesAPI, featuresAPI, implementationsAPI } from '../services/api';
import { ImplementationMatrix } from '../components/ImplementationMatrix';

export const ImplementationMatrixPage: React.FC = () => {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [implementations, setImplementations] = useState<Implementation[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: undefined,
  });

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoadingState({ isLoading: true });
      
      // Load airlines, features, and implementations in parallel
      const [airlinesData, featuresData, implementationsData] = await Promise.all([
        airlinesAPI.getAll(),
        featuresAPI.getAll(),
        implementationsAPI.getAll(),
      ]);
      
      setAirlines(airlinesData);
      setFeatures(featuresData);
      setImplementations(implementationsData);
      setLoadingState({ isLoading: false });
    } catch (error) {
      setLoadingState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data',
      });
    }
  };

  const handleUpdateImplementation = async (id: number, data: Partial<CreateImplementationRequest>) => {
    try {
      const updatedImplementation = await implementationsAPI.updateById(id, data);
      setImplementations(prev =>
        prev.map(impl => impl.id === id ? updatedImplementation : impl)
      );
      console.log('Implementation updated successfully');
    } catch (error) {
      console.error('Failed to update implementation:', error);
      throw error;
    }
  };

  const handleCreateImplementation = async (data: CreateImplementationRequest) => {
    try {
      const newImplementation = await implementationsAPI.create(data);
      setImplementations(prev => [...prev, newImplementation]);
      console.log('Implementation created successfully');
    } catch (error) {
      console.error('Failed to create implementation:', error);
      throw error;
    }
  };

  const renderContent = () => {
    if (loadingState.error) {
      return (
        <div className="error-container">
          <h3>Error Loading Data</h3>
          <p>{loadingState.error}</p>
          <button onClick={loadAllData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      );
    }

    if (airlines.length === 0 || features.length === 0) {
      return (
        <div className="empty-state">
          <h3>No Data Available</h3>
          <p>Please add airlines and features first before using the implementation matrix.</p>
        </div>
      );
    }

    return (
      <ImplementationMatrix
        airlines={airlines}
        features={features}
        implementations={implementations}
        onUpdateImplementation={handleUpdateImplementation}
        onCreateImplementation={handleCreateImplementation}
        isLoading={loadingState.isLoading}
      />
    );
  };

  return (
    <div className="implementation-matrix-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Implementation Matrix</h1>
          <p>Manage feature implementations across airlines</p>
        </div>

        <div className="page-actions">
          <button
            onClick={loadAllData}
            className="btn btn-secondary"
            disabled={loadingState.isLoading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="page-content">
        {renderContent()}
      </div>
    </div>
  );
};