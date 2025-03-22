import express from 'express';
import { requestChallenge, verifyChallenge, getProfile, updateUserRoles } from '../controllers/authController';
import { authenticateJWT, authorize } from '../../utils/auth';
import { UserRole } from '../../models/User';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Wallet-based authentication
 */

/**
 * @swagger
 * /api/auth/challenge:
 *   post:
 *     summary: Request a challenge for wallet authentication
 *     description: Get a nonce to sign with your wallet
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 description: Ethereum wallet address
 *     responses:
 *       200:
 *         description: Challenge created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 challenge:
 *                   type: string
 *                 nonce:
 *                   type: string
 */
router.post('/challenge', requestChallenge);

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify wallet signature
 *     description: Authenticate with wallet signature
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *               - signature
 *               - nonce
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 description: Ethereum wallet address
 *               signature:
 *                 type: string
 *                 description: Signed challenge message
 *               nonce:
 *                 type: string
 *                 description: Nonce from challenge request
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     walletAddress:
 *                       type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.post('/verify', verifyChallenge);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     description: Get current authenticated user profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 walletAddress:
 *                   type: string
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 */
router.get('/profile', authenticateJWT, getProfile);

/**
 * @swagger
 * /api/auth/roles:
 *   put:
 *     summary: Update user roles
 *     description: Update roles for a user (admin only)
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *               - roles
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 description: Ethereum wallet address
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [employer, professional, admin]
 *     responses:
 *       200:
 *         description: User roles updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     walletAddress:
 *                       type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.put('/roles', authenticateJWT, authorize([UserRole.ADMIN]), updateUserRoles);

export default router; 