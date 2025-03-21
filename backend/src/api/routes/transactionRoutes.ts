import express from 'express';
import * as transactionController from '../controllers/transactionController';

const router = express.Router();

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     description: Retrieve a list of all transactions with optional filtering
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: itemId
 *         schema:
 *           type: string
 *         description: Filter transactions by item ID
 *       - in: query
 *         name: seller
 *         schema:
 *           type: string
 *         description: Filter transactions by seller address
 *       - in: query
 *         name: buyer
 *         schema:
 *           type: string
 *         description: Filter transactions by buyer address
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, success, failed]
 *         description: Filter transactions by status
 *     responses:
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', transactionController.getTransactions);

/**
 * @swagger
 * /api/transactions/{hash}:
 *   get:
 *     summary: Get transaction details
 *     description: Retrieve details for a specific transaction by its hash, with blockchain verification for pending transactions
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction hash
 *     responses:
 *       200:
 *         description: Transaction details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
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
router.get('/:hash', transactionController.getTransaction);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Record a new transaction
 *     description: Record a new blockchain transaction in the database
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hash
 *             properties:
 *               hash:
 *                 type: string
 *                 description: Transaction hash
 *               eventType:
 *                 type: string
 *                 description: Type of blockchain event
 *               itemId:
 *                 type: string
 *                 description: ID of the item involved in the transaction
 *               seller:
 *                 type: string
 *                 description: Seller address
 *               buyer:
 *                 type: string
 *                 description: Buyer address
 *               price:
 *                 type: string
 *                 description: Transaction price in ETH
 *     responses:
 *       201:
 *         description: Transaction successfully recorded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       409:
 *         description: Transaction already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', transactionController.recordTransaction);

/**
 * @swagger
 * /api/transactions/listen:
 *   post:
 *     summary: Start event listener
 *     description: Start listening for marketplace contract events and record them automatically
 *     tags: [Blockchain]
 *     responses:
 *       200:
 *         description: Event listener started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/listen', transactionController.listenForEvents);

export default router; 