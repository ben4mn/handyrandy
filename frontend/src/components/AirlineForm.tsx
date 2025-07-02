import React, { useState, useEffect } from 'react';
import { Airline, CreateAirlineRequest, AIRLINE_STATUSES } from '../types';

interface AirlineFormProps {
  airline?: Airline;
  onSubmit: (airline: CreateAirlineRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const AirlineForm: React.FC<AirlineFormProps> = ({
  airline,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<CreateAirlineRequest>({
    name: '',
    codes: '',
    provider: '',
    status: 'Development',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (airline) {
      setFormData({
        name: airline.name,
        codes: airline.codes,
        provider: airline.provider,
        status: airline.status,
      });
    }
  }, [airline]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Airline name is required';
    }

    if (!formData.codes.trim()) {
      newErrors.codes = 'Airline codes are required';
    }

    if (!formData.provider.trim()) {
      newErrors.provider = 'Provider is required';
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
    <div className="airline-form-container">
      <div className="form-header">
        <h2>{airline ? 'Edit Airline' : 'Add New Airline'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="airline-form">
        <div className="form-group">
          <label htmlFor="name">Airline Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            placeholder="e.g., American Airlines"
            disabled={isSubmitting}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="codes">Airline Codes *</label>
          <input
            type="text"
            id="codes"
            name="codes"
            value={formData.codes}
            onChange={handleChange}
            className={errors.codes ? 'error' : ''}
            placeholder="e.g., AA or LH, OS, SN"
            disabled={isSubmitting}
          />
          {errors.codes && <span className="error-message">{errors.codes}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="provider">Provider *</label>
          <input
            type="text"
            id="provider"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            className={errors.provider ? 'error' : ''}
            placeholder="e.g., Sabre, Amadeus, Altea NDC"
            disabled={isSubmitting}
          />
          {errors.provider && <span className="error-message">{errors.provider}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="status">Status *</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            {AIRLINE_STATUSES.map(status => (
              <option key={status} value={status}>
                {status}
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
            {isSubmitting ? 'Saving...' : (airline ? 'Update Airline' : 'Create Airline')}
          </button>
        </div>
      </form>
    </div>
  );
};