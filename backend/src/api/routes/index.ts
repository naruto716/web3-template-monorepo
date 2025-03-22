import express from 'express';
import itemRoutes from './itemRoutes';
import transactionRoutes from './transactionRoutes';
import talentRoutes from './talentRoutes';
import authRoutes from './authRoutes';


/**
 * @swagger
 * tags:
 *   - name: Items
 *     description: Item management
 *   - name: Transactions
 *     description: Transaction management
 *   - name: Blockchain
 *     description: Direct blockchain operations
 *   - name: Talents
 *     description: Talent search and management
 *   - name: Authentication
 *     description: Wallet-based authentication
 */

const router = express.Router();

// Register routes
router.use('/items', itemRoutes);
router.use('/transactions', transactionRoutes);
router.use('/talents', talentRoutes);
router.use('/auth', authRoutes);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health
 *     description: Check if the API is up and running
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default router; 