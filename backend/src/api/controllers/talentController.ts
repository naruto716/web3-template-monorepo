import { Request, Response } from 'express';
import * as talentService from '../../services/talentService';
import logger from '../../utils/logger';

export const searchTalents = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      skills,
      query,
      priceRange,
      availability,
      location,
      experience,
      sortBy,
      sortOrder,
      page = 1,
      limit = 50
    } = req.query;

    logger.info('Search talents request:', { 
      query: req.query,
      url: req.url
    });

    // Parse and validate query parameters
    const filters = {
      skills: Array.isArray(skills) 
        ? skills.map(s => String(s)) 
        : skills 
        ? [String(skills)] 
        : undefined,
      query: query as string,
      priceRange: priceRange ? JSON.parse(priceRange as string) : undefined,
      availability: availability as 'available' | 'unavailable' | 'all',
      location: location as string,
      experience: experience as 'entry' | 'intermediate' | 'expert',
      yearsOfExperience: req.query.yearsOfExperience 
        ? JSON.parse(req.query.yearsOfExperience as string) 
        : undefined
    };

    // Validate numeric parameters
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));

    const result = await talentService.searchTalents(
      filters,
      {
        sortBy: sortBy as 'skills.hourlyRate' | 'experience' | 'createdAt' | 'skills.yearsOfExperience',
        sortOrder: sortOrder as 'asc' | 'desc'
      },
      {
        page: pageNum,
        limit: limitNum
      }
    );

    res.status(200).json({
      status: 200,
      data: result
    });
  } catch (error) {
    logger.error('Error in searchTalents controller:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      query: req.query
    });
    res.status(500).json({
      status: 500,
      error: 'Failed to search talents'
    });
  }
}; 