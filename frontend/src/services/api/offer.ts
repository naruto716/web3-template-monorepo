import client from './client';

export interface OfferCreateRequest {
  jobDescription: string;
  startDate: string;
  endDate: string;
  totalWorkHours: number;
  totalPay: string;
  talentId: string;
}

export interface Offer {
  _id: string;
  jobDescription: string;
  startDate: string;
  endDate: string;
  totalWorkHours: number;
  totalPay: string;
  employerId: {
    _id: string;
    walletAddress: string;
  };
  talentId: {
    _id: string;
    walletAddress: string;
  };
  status: 'waiting' | 'accepted' | 'paid' | 'working' | 'finished';
  paymentTxHash?: string;
  workStartedAt?: string;
  workCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferListResponse {
  offers: Offer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

// Offer service for interacting with the offers API
export const offerApi = {
  // Create a new offer
  createOffer: async (data: OfferCreateRequest): Promise<Offer> => {
    const response = await client.post<{ status: number; data: Offer }>('/offers', data);
    return response.data.data;
  },

  // Get a specific offer by ID
  getOfferById: async (id: string): Promise<Offer> => {
    const response = await client.get<{ status: number; data: Offer }>(`/offers/${id}`);
    return response.data.data;
  },

  // Get all offers with pagination
  getAllOffers: async (page = 1, limit = 10, role = 'employer'): Promise<OfferListResponse> => {
    const response = await client.get<{ status: number; data: OfferListResponse }>(
      `/offers?page=${page}&limit=${limit}&role=${role}`
    );
    return response.data.data;
  },

  // Update offer status
  updateOfferStatus: async (id: string, status: Offer['status'], paymentTxHash?: string): Promise<Offer> => {
    const response = await client.put<{ status: number; data: Offer }>(`/offers/${id}`, { 
      status,
      paymentTxHash
    });
    return response.data.data;
  }
}; 