import { Talent, ITalent } from '../models/Talent';
import { ethers } from 'ethers';
import logger from '../utils/logger';

interface SearchFilters {
  skills?: string[];
  query?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  availability?: 'available' | 'unavailable' | 'all';
  location?: string;
  experience?: 'entry' | 'intermediate' | 'expert';
}

interface SortOptions {
  sortBy?: 'hourlyRate' | 'rating' | 'experience' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface PaginationOptions {
  page: number;
  limit: number;
}

interface SearchResult {
  talents: ITalent[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const searchTalents = async (
  filters: SearchFilters,
  sort: SortOptions,
  pagination: PaginationOptions
): Promise<SearchResult> => {
  try {
    const query: Record<string, any> = {};

    // Text search if query provided
    if (filters.query) {
      query.$text = { $search: filters.query };
    }

    // Skills filter
    if (filters.skills?.length) {
      query.skills = { $all: filters.skills };
    }

    // Price range filter
    if (filters.priceRange?.min || filters.priceRange?.max) {
      query.hourlyRate = {};
      if (filters.priceRange.min) {
        query.hourlyRate.$gte = ethers.parseEther(filters.priceRange.min.toString()).toString();
      }
      if (filters.priceRange.max) {
        query.hourlyRate.$lte = ethers.parseEther(filters.priceRange.max.toString()).toString();
      }
    }

    // Availability filter
    if (filters.availability && filters.availability !== 'all') {
      query.availability = filters.availability === 'available';
    }

    // Location filter
    if (filters.location) {
      query.location = filters.location;
    }

    // Experience filter
    if (filters.experience) {
      query.experience = filters.experience;
    }

    // Calculate skip value for pagination
    const skip = (pagination.page - 1) * pagination.limit;

    // Build sort object
    const sortObj: Record<string, 1 | -1> = {};
    if (sort.sortBy) {
      sortObj[sort.sortBy] = sort.sortOrder === 'asc' ? 1 : -1;
    } else {
      sortObj.createdAt = -1; // Default sort
    }

    // Execute query with pagination
    const [talents, totalItems] = await Promise.all([
      Talent.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(pagination.limit),
      Talent.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / pagination.limit);

    return {
      talents,
      pagination: {
        currentPage: pagination.page,
        totalPages,
        totalItems,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      }
    };
  } catch (error) {
    logger.error('Error in searchTalents service:', error);
    throw error;
  }
}; 