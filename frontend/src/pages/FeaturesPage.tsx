import React, { useState, useEffect } from 'react';
import { Feature, CreateFeatureRequest, LoadingState } from '../types';
import { featuresAPI } from '../services/api';
import { FeatureList } from '../components/FeatureList';
import { FeatureForm } from '../components/FeatureForm';

type ViewMode = 'list' | 'add' | 'edit' | 'view';

export const FeaturesPage: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [currentFeature, setCurrentFeature] = useState<Feature | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load features on component mount
  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      setLoadingState({ isLoading: true });
      const featuresData = await featuresAPI.getAll();
      setFeatures(featuresData);
      setLoadingState({ isLoading: false });
    } catch (error) {
      setLoadingState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load features',
      });
    }
  };

  const handleCreateFeature = async (featureData: CreateFeatureRequest) => {
    setIsSubmitting(true);
    try {
      const newFeature = await featuresAPI.create(featureData);
      setFeatures(prev => [...prev, newFeature]);
      setViewMode('list');
      console.log('Feature created successfully');
    } catch (error) {
      console.error('Failed to create feature:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFeature = async (featureData: CreateFeatureRequest) => {
    if (!currentFeature) return;

    setIsSubmitting(true);
    try {
      const updatedFeature = await featuresAPI.update(currentFeature.id, featureData);
      setFeatures(prev =>
        prev.map(feature =>
          feature.id === currentFeature.id ? updatedFeature : feature
        )
      );
      setViewMode('list');
      setCurrentFeature(null);
      console.log('Feature updated successfully');
    } catch (error) {
      console.error('Failed to update feature:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFeature = async (feature: Feature) => {
    if (!window.confirm(`Are you sure you want to delete "${feature.name}"?`)) {
      return;
    }

    try {
      await featuresAPI.delete(feature.id);
      setFeatures(prev => prev.filter(f => f.id !== feature.id));
      console.log('Feature deleted successfully');
    } catch (error) {
      console.error('Failed to delete feature:', error);
      alert('Failed to delete feature. Please try again.');
    }
  };

  const handleViewFeature = (feature: Feature) => {
    setCurrentFeature(feature);
    setViewMode('view');
  };

  const handleEditFeature = (feature: Feature) => {
    setCurrentFeature(feature);
    setViewMode('edit');
  };

  const handleAddNew = () => {
    setCurrentFeature(null);
    setViewMode('add');
  };

  const handleCancel = () => {
    setCurrentFeature(null);
    setViewMode('list');
  };

  const renderContent = () => {
    if (loadingState.error) {
      return (
        <div className="error-container">
          <h3>Error Loading Features</h3>
          <p>{loadingState.error}</p>
          <button onClick={loadFeatures} className="btn btn-primary">
            Try Again
          </button>
        </div>
      );
    }

    switch (viewMode) {
      case 'add':
        return (
          <FeatureForm
            onSubmit={handleCreateFeature}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        );

      case 'edit':
        return (
          <FeatureForm
            feature={currentFeature!}
            onSubmit={handleUpdateFeature}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        );

      case 'view':
        return (
          <div className="feature-details">
            <div className="details-header">
              <h2>{currentFeature?.name}</h2>
              <div className="details-actions">
                <button
                  onClick={() => handleEditFeature(currentFeature!)}
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
                <span>{currentFeature?.name}</span>
              </div>
              <div className="detail-item">
                <label>Category:</label>
                <span>{currentFeature?.category}</span>
              </div>
              <div className="detail-item">
                <label>Description:</label>
                <span>{currentFeature?.description}</span>
              </div>
              <div className="detail-item">
                <label>Created:</label>
                <span>{currentFeature ? new Date(currentFeature.created_at).toLocaleDateString() : ''}</span>
              </div>
              <div className="detail-item">
                <label>Last Updated:</label>
                <span>{currentFeature ? new Date(currentFeature.updated_at).toLocaleDateString() : ''}</span>
              </div>
            </div>
          </div>
        );

      case 'list':
      default:
        return (
          <FeatureList
            features={features}
            onEdit={handleEditFeature}
            onDelete={handleDeleteFeature}
            onView={handleViewFeature}
            isLoading={loadingState.isLoading}
          />
        );
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-container">
          <div className="page-title">
            <h1>Features Management</h1>
            <p>Manage NDC features and capabilities</p>
          </div>

          {viewMode === 'list' && (
            <div className="page-actions">
              <button
                onClick={handleAddNew}
                className="btn btn-primary"
              >
                + Add New Feature
              </button>
              <button
                onClick={loadFeatures}
                className="btn btn-secondary"
                disabled={loadingState.isLoading}
              >
                🔄 Refresh
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {renderContent()}
        </div>
      </div>
    </>
  );
};