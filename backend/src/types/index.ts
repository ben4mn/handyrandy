// Database types
export interface Airline {
  id: number;
  name: string;
  codes: string;
  provider: string;
  status: 'Production' | 'Pilot' | 'Development' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: number;
  category: 'Shopping' | 'Global' | 'Booking' | 'Servicing' | 'Payment';
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Implementation {
  id: number;
  airline_id: number;
  feature_id: number;
  value: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Request types
export interface CreateAirlineRequest {
  name: string;
  codes: string;
  provider: string;
  status: Airline['status'];
}

export interface UpdateAirlineRequest extends Partial<CreateAirlineRequest> {}

export interface CreateFeatureRequest {
  category: Feature['category'];
  name: string;
  description?: string;
}

export interface UpdateFeatureRequest extends Partial<CreateFeatureRequest> {}

export interface CreateImplementationRequest {
  airline_id: number;
  feature_id: number;
  value: string;
  notes?: string;
}

export interface UpdateImplementationRequest extends Partial<Omit<CreateImplementationRequest, 'airline_id' | 'feature_id'>> {}

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}