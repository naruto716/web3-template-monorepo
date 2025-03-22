import client from './client';

// Interface for talent search parameters
export interface TalentSearchParams {
  skills?: string[];
  query?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  availability?: 'available' | 'unavailable' | 'all';
  location?: string;
  experience?: 'entry' | 'intermediate' | 'expert';
  sortBy?: 'hourlyRate' | 'rating' | 'experience' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  yearsOfExperience?: {
    min?: number;
    max?: number;
  };
}

// Interface for talent skill
export interface TalentSkill {
  name: string;
  hourlyRate: string;
  yearsOfExperience: number;
  _id: string;
  isMatched: boolean;
}

// Interface for talent response from API
export interface Talent {
  _id: string;
  name: string;
  description: string;
  skills: TalentSkill[];
  availability: boolean;
  experience: string;
  location: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
  matchedSkills: string[];
}

// Interface for pagination info
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API response for talent search
export interface TalentApiResponse {
  talents: Talent[];
  pagination: Pagination;
}

// Interface for our app's standardized search response
export interface TalentSearchResponse {
  results: Talent[];
  total: number;
  page: number;
  limit: number;
}

// Talent service for interacting with the talent API
export const talentApi = {
  // Search for talents based on various criteria
  searchTalents: async (params: TalentSearchParams = {}): Promise<TalentSearchResponse> => {
    const response = await client.get<{ data: TalentApiResponse }>('/talents/search', { params });
    
    // Map the API response to our expected format
    return {
      results: response.data.data.talents,
      total: response.data.data.pagination.totalItems,
      page: response.data.data.pagination.currentPage,
      limit: params.limit || 10
    };
  },
  
  // Get a single talent by ID
  getTalentById: async (id: string): Promise<Talent> => {
    const response = await client.get<{ data: Talent }>(`/talents/${id}`);
    return response.data.data;
  }
}; 