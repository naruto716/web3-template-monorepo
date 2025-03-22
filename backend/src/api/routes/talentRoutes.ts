import express from 'express';
import * as talentController from '../controllers/talentController';
import { authenticateJWT, authorize } from '../../utils/auth';
import { UserRole } from '../../models/User';

const router = express.Router();

/**
 * @swagger
 * /api/talents/search:
 *   get:
 *     summary: Search for talents
 *     description: Search and filter talents based on various criteria
 *     tags: [Talents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skills
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *         description: Array of skill keywords to search for
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: General search term for name and description
 *       - in: query
 *         name: priceRange.min
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum hourly rate in ETH
 *       - in: query
 *         name: priceRange.max
 *         schema:
 *           type: number
 *         description: Maximum hourly rate in ETH
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum: [available, unavailable, all]
 *         description: Filter by talent availability status
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location/timezone
 *       - in: query
 *         name: experience
 *         schema:
 *           type: string
 *           enum: [entry, intermediate, expert]
 *         description: Filter by experience level
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [hourlyRate, rating, experience, createdAt]
 *         default: createdAt
 *         description: Field to sort results by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         default: desc
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: yearsOfExperience.min
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum years of experience for skills
 *       - in: query
 *         name: yearsOfExperience.max
 *         schema:
 *           type: number
 *         description: Maximum years of experience for skills
 *     responses:
 *       200:
 *         description: Successful search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TalentSearchResponse'
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', authenticateJWT, authorize([UserRole.EMPLOYER]), talentController.searchTalents);

export default router; 