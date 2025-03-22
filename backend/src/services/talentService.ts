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
  yearsOfExperience?: {
    min?: number;
    max?: number;
  };
}

interface SortOptions {
  sortBy?: 'skills.hourlyRate' | 'experience' | 'createdAt' | 'skills.yearsOfExperience';
  sortOrder?: 'asc' | 'desc';
}

interface PaginationOptions {
  page: number;
  limit: number;
}

interface ISkillWithMatch extends ISkill {
  isMatched?: boolean;
}

interface ITalentWithMatchedSkills extends Omit<ITalent, 'skills'> {
  skills: ISkillWithMatch[];
  matchedSkills?: string[];
}

interface SearchResult {
  talents: ITalentWithMatchedSkills[];
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
    const searchedSkills = filters.skills || [];

    // Text search if query provided
    if (filters.query) {
      query.$text = { $search: filters.query };
    }

    // Skills filter
    if (searchedSkills.length) {
      query['skills.name'] = { 
        $in: searchedSkills.map(skill => 
          new RegExp(skill, 'i')
        ) 
      };
    }

    // Price range filter
    if (filters.priceRange?.min || filters.priceRange?.max) {
      query['skills.hourlyRate'] = {};
      if (filters.priceRange.min) {
        query['skills.hourlyRate'].$gte = ethers.parseEther(filters.priceRange.min.toString()).toString();
      }
      if (filters.priceRange.max) {
        query['skills.hourlyRate'].$lte = ethers.parseEther(filters.priceRange.max.toString()).toString();
      }
    }

    // Years of experience filter
    if (filters.yearsOfExperience?.min || filters.yearsOfExperience?.max) {
      query['skills.yearsOfExperience'] = {};
      if (filters.yearsOfExperience.min) {
        query['skills.yearsOfExperience'].$gte = filters.yearsOfExperience.min;
      }
      if (filters.yearsOfExperience.max) {
        query['skills.yearsOfExperience'].$lte = filters.yearsOfExperience.max;
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

    // Process talents to mark matched skills
    const processedTalents = talents.map(talent => {
      const talentObj = talent.toObject();
      const matchedSkills: string[] = [];
      
      const processedSkills = talentObj.skills.map(skill => {
        const isMatched = searchedSkills.some(searchSkill => 
          skill.name.toLowerCase().includes(searchSkill.toLowerCase())
        );
        
        if (isMatched) {
          matchedSkills.push(skill.name);
        }
        
        return {
          ...skill,
          isMatched
        };
      });

      return {
        ...talentObj,
        skills: processedSkills,
        matchedSkills
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / pagination.limit);

    return {
      talents: processedTalents,
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