import axios, { AxiosResponse } from 'axios';
import {
  ApiResponse,
  Airline,
  Feature,
  Implementation,
  AirlineWithImplementations,
  FeatureWithImplementations,
  CreateAirlineRequest,
  UpdateAirlineRequest,
  CreateFeatureRequest,
  UpdateFeatureRequest,
  CreateImplementationRequest,
  UpdateImplementationRequest,
} from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api', // Use relative path since frontend and backend are served from same domain/port
  timeout: 30000, // Increased timeout for AI requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'API request failed');
    }
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Network error occurred');
    }
  }
);

// Airlines API
export const airlinesAPI = {
  // Get all airlines
  getAll: async (): Promise<Airline[]> => {
    const response = await api.get<ApiResponse<Airline[]>>('/airlines');
    return response.data.data || [];
  },

  // Get airline by ID
  getById: async (id: number): Promise<Airline> => {
    const response = await api.get<ApiResponse<Airline>>(`/airlines/${id}`);
    return response.data.data!;
  },

  // Get airline with implementations
  getWithImplementations: async (id: number): Promise<AirlineWithImplementations> => {
    const response = await api.get<ApiResponse<AirlineWithImplementations>>(`/airlines/${id}/implementations`);
    return response.data.data!;
  },

  // Create new airline
  create: async (airline: CreateAirlineRequest): Promise<Airline> => {
    const response = await api.post<ApiResponse<Airline>>('/airlines', airline);
    return response.data.data!;
  },

  // Update airline
  update: async (id: number, updates: UpdateAirlineRequest): Promise<Airline> => {
    const response = await api.put<ApiResponse<Airline>>(`/airlines/${id}`, updates);
    return response.data.data!;
  },

  // Delete airline
  delete: async (id: number): Promise<void> => {
    await api.delete(`/airlines/${id}`);
  },
};

// Features API
export const featuresAPI = {
  // Get all features
  getAll: async (): Promise<Feature[]> => {
    const response = await api.get<ApiResponse<Feature[]>>('/features');
    return response.data.data || [];
  },

  // Get feature by ID
  getById: async (id: number): Promise<Feature> => {
    const response = await api.get<ApiResponse<Feature>>(`/features/${id}`);
    return response.data.data!;
  },

  // Get feature with implementations
  getWithImplementations: async (id: number): Promise<FeatureWithImplementations> => {
    const response = await api.get<ApiResponse<FeatureWithImplementations>>(`/features/${id}/implementations`);
    return response.data.data!;
  },

  // Create new feature
  create: async (feature: CreateFeatureRequest): Promise<Feature> => {
    const response = await api.post<ApiResponse<Feature>>('/features', feature);
    return response.data.data!;
  },

  // Update feature
  update: async (id: number, updates: UpdateFeatureRequest): Promise<Feature> => {
    const response = await api.put<ApiResponse<Feature>>(`/features/${id}`, updates);
    return response.data.data!;
  },

  // Delete feature
  delete: async (id: number): Promise<void> => {
    await api.delete(`/features/${id}`);
  },
};

// Chat API
export const chatAPI = {
  // Send a message to the AI
  sendMessage: async (message: string, conversationHistory: any[] = []): Promise<any> => {
    try {
      const response = await api.post<ApiResponse<any>>('/chat', {
        message,
        conversationHistory
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Chat request failed');
      }
      
      return response.data.data!;
    } catch (error) {
      console.error('Chat API error:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. The AI service might be taking longer than expected.');
        }
        if (error.response) {
          throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || error.message}`);
        }
        if (error.request) {
          throw new Error('Unable to connect to the AI service. Please check your connection.');
        }
      }
      throw error;
    }
  },

  // Check if AI service is available
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await api.get<ApiResponse>('/chat/health');
      return response.data.success;
    } catch (error) {
      return false;
    }
  },

  // Get example queries
  getExamples: async (): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>('/chat/examples');
    return response.data.data || [];
  },
};

// Implementations API
export const implementationsAPI = {
  // Get all implementations
  getAll: async (): Promise<Implementation[]> => {
    const response = await api.get<ApiResponse<Implementation[]>>('/implementations');
    return response.data.data || [];
  },

  // Get implementation by ID
  getById: async (id: number): Promise<Implementation> => {
    const response = await api.get<ApiResponse<Implementation>>(`/implementations/${id}`);
    return response.data.data!;
  },

  // Get implementation by airline and feature
  getByAirlineAndFeature: async (airlineId: number, featureId: number): Promise<Implementation | null> => {
    try {
      const response = await api.get<ApiResponse<Implementation>>(`/implementations/${airlineId}/${featureId}`);
      return response.data.data!;
    } catch (error) {
      // Return null if not found (404)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Create new implementation
  create: async (implementation: CreateImplementationRequest): Promise<Implementation> => {
    const response = await api.post<ApiResponse<Implementation>>('/implementations', implementation);
    return response.data.data!;
  },

  // Update implementation by airline and feature IDs
  update: async (airlineId: number, featureId: number, updates: UpdateImplementationRequest): Promise<Implementation> => {
    const response = await api.put<ApiResponse<Implementation>>(`/implementations/${airlineId}/${featureId}`, updates);
    return response.data.data!;
  },

  // Update implementation by ID
  updateById: async (id: number, updates: UpdateImplementationRequest): Promise<Implementation> => {
    const response = await api.put<ApiResponse<Implementation>>(`/implementations/${id}`, updates);
    return response.data.data!;
  },

  // Delete implementation
  delete: async (airlineId: number, featureId: number): Promise<void> => {
    await api.delete(`/implementations/${airlineId}/${featureId}`);
  },
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    await api.get('/health');
    return true;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

export default api;