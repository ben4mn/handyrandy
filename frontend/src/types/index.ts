// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Entity types
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

// Extended types with relationships
export interface AirlineWithImplementations extends Airline {
  implementations: (Implementation & {
    feature_name: string;
    feature_category: string;
    feature_description?: string;
  })[];
}

export interface FeatureWithImplementations extends Feature {
  implementations: (Implementation & {
    airline_name: string;
    airline_codes: string;
    airline_provider: string;
    airline_status: string;
  })[];
}

// Form types
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

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface FormState {
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: any[];
}

export interface ChatExample {
  category: string;
  queries: string[];
}

// Constants
export const AIRLINE_STATUSES: Airline['status'][] = ['Production', 'Pilot', 'Development', 'Inactive'];
export const FEATURE_CATEGORIES: Feature['category'][] = ['Shopping', 'Global', 'Booking', 'Servicing', 'Payment'];