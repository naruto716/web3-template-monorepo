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
      limit = 10
    } = req.query;

    // Parse and validate query parameters
    const filters = {
      skills: Array.isArray(skills) ? skills : skills ? [skills as string] : undefined,
      query: query as string,
      priceRange: priceRange ? JSON.parse(priceRange as string) : undefined,
      availability: availability as 'available' | 'unavailable' | 'all',
      location: location as string,
      experience: experience as 'entry' | 'intermediate' | 'expert'
    };

    // Validate numeric parameters
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));

    const result = await talentService.searchTalents(
      filters,
      {
        sortBy: sortBy as 'hourlyRate' | 'rating' | 'experience' | 'createdAt',
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
    logger.error('Error in searchTalents controller:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to search talents'
    });
  }
}; 