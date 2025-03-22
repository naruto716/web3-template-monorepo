import express from 'express';
import * as offerController from '../controllers/offerController';
import { authenticateJWT, authorize } from '../../utils/auth';
import { UserRole } from '../../models/User';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Offers
 *   description: Job offer management
 */

/**
 * @swagger
 * /api/offers:
 *   post:
 *     summary: Create a new job offer
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobDescription
 *               - startDate
 *               - endDate
 *               - totalWorkHours
 *               - totalPay
 *               - talentId
 *             properties:
 *               jobDescription:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               totalWorkHours:
 *                 type: integer
 *                 minimum: 1
 *               totalPay:
 *                 type: string
 *               talentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Offer created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an employer
 *   get:
 *     summary: Get all offers for authenticated user
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of offers
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/offers/{id}:
 *   get:
 *     summary: Get offer by ID
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer details
 *       404:
 *         description: Offer not found
 *   put:
 *     summary: Update offer status
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [waiting, accepted, paid, working, finished]
 *               paymentTxHash:
 *                 type: string
 *     responses:
 *       200:
 *         description: Offer updated successfully
 *       404:
 *         description: Offer not found
 */

router.post('/', 
  authenticateJWT, 
  authorize([UserRole.EMPLOYER]), 
  offerController.createOffer
);

router.put('/:id', 
  authenticateJWT, 
  authorize([UserRole.EMPLOYER, UserRole.PROFESSIONAL]), 
  offerController.updateOffer
);

router.get('/:id', 
  authenticateJWT, 
  authorize([UserRole.EMPLOYER, UserRole.PROFESSIONAL]), 
  offerController.getOfferById
);

router.get('/', 
  authenticateJWT, 
  authorize([UserRole.EMPLOYER, UserRole.PROFESSIONAL]), 
  offerController.getAllOffers
);

export default router; 