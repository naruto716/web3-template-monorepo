import client from './client';
import { OfferListResponse } from './offer';

export const contractsApi = {
  // Get user's contract history (either as talent or employer)
  getUserContracts: async (page = 1, limit = 20): Promise<OfferListResponse> => {
    try {
      const response = await client.get<{ status: number; data: OfferListResponse }>(
        `/offers?page=${page}&limit=${limit}`
      );
      
      // Ensure response has the expected structure
      const offers = response?.data?.data?.offers || [];
      const pagination = response?.data?.data?.pagination || { 
        currentPage: page, 
        totalPages: 1, 
        totalItems: offers.length 
      };
      
      return {
        offers,
        pagination
      };
    } catch (error) {
      console.error("Error fetching user contracts:", error);
      // Return a default empty response
      return {
        offers: [],
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalItems: 0
        }
      };
    }
  },
  
  // Get contracts by professional ID (for admin or employer viewing talent history)
  getContractsByTalentId: async (talentId: string, page = 1, limit = 20): Promise<OfferListResponse> => {
    try {
      const response = await client.get<{ status: number; data: OfferListResponse }>(
        `/offers?talentId=${talentId}&page=${page}&limit=${limit}`
      );
      
      // Ensure response has the expected structure
      const offers = response?.data?.data?.offers || [];
      const pagination = response?.data?.data?.pagination || { 
        currentPage: page, 
        totalPages: 1, 
        totalItems: offers.length 
      };
      
      return {
        offers,
        pagination
      };
    } catch (error) {
      console.error(`Error fetching contracts for talent ${talentId}:`, error);
      // Return a default empty response
      return {
        offers: [],
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalItems: 0
        }
      };
    }
  },
  
  // Get contracts by employer ID (for admin or talent viewing employer history)
  getContractsByEmployerId: async (employerId: string, page = 1, limit = 20): Promise<OfferListResponse> => {
    try {
      const response = await client.get<{ status: number; data: OfferListResponse }>(
        `/offers?employerId=${employerId}&page=${page}&limit=${limit}`
      );
      
      // Ensure response has the expected structure
      const offers = response?.data?.data?.offers || [];
      const pagination = response?.data?.data?.pagination || { 
        currentPage: page, 
        totalPages: 1, 
        totalItems: offers.length 
      };
      
      return {
        offers,
        pagination
      };
    } catch (error) {
      console.error(`Error fetching contracts for employer ${employerId}:`, error);
      // Return a default empty response
      return {
        offers: [],
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalItems: 0
        }
      };
    }
  },
  
  // Find contracts between a specific employer and talent
  findContractsBetween: async (employerId: string, talentId: string): Promise<OfferListResponse> => {
    try {
      if (!employerId || !talentId) {
        throw new Error("Both employerId and talentId are required MongoDB IDs");
      }
      
      const response = await client.get<{ status: number; data: OfferListResponse }>(
        `/offers/find?employerId=${employerId}&talentId=${talentId}`
      );
      
      // Ensure response has the expected structure
      const offers = response?.data?.data?.offers || [];
      
      return {
        offers,
        pagination: {
          currentPage: 1, 
          totalPages: 1, 
          totalItems: offers.length 
        }
      };
    } catch (error) {
      console.error(`Error finding contracts between employer ${employerId} and talent ${talentId}:`, error);
      // Return a default empty response
      return {
        offers: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0
        }
      };
    }
  }
}; 