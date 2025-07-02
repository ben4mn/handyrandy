import React, { useState, useEffect } from 'react';
import { Feature, CreateFeatureRequest, FEATURE_CATEGORIES } from '../types';

interface FeatureFormProps {
  feature?: Feature;
  onSubmit: (feature: CreateFeatureRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const FeatureForm: React.FC<FeatureFormProps> = ({
  feature,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<CreateFeatureRequest>({
    name: '',
    description: '',
    category: 'Booking',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (feature) {
      setFormData({
        name: feature.name,
        description: feature.description || '',
        category: feature.category,
      });
    }
  }, [feature]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Feature name is required';
    }


    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="feature-form-container">
      <div className="form-header">
        <h2>{feature ? 'Edit Feature' : 'Add New Feature'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="feature-form">
        <div className="form-group">
          <label htmlFor="name">Feature Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            placeholder="e.g., Seat Selection"
            disabled={isSubmitting}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? 'error' : ''}
            placeholder="Describe the feature functionality..."
            rows={4}
            disabled={isSubmitting}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            {FEATURE_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (feature ? 'Update Feature' : 'Create Feature')}
          </button>
        </div>
      </form>
    </div>
  );
};