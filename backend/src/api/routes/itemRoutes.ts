import express from 'express';
import * as itemController from '../controllers/itemController';

const router = express.Router();

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items
 *     description: Retrieve a list of all items with optional filtering
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: seller
 *         schema:
 *           type: string
 *         description: Filter items by seller address
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [listed, sold]
 *         description: Filter items by status
 *     responses:
 *       200:
 *         description: A list of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', itemController.getAllItems);

/**
 * @swagger
 * /api/items/blockchain:
 *   get:
 *     summary: Get items directly from blockchain
 *     description: Retrieve items that are for sale on the blockchain (bypass database)
 *     tags: [Blockchain]
 *     responses:
 *       200:
 *         description: A list of blockchain items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BlockchainItem'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/blockchain', itemController.getBlockchainItems);

/**
 * @swagger
 * /api/items/{itemId}:
 *   get:
 *     summary: Get a specific item
 *     description: Retrieve a single item with blockchain verification
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the item to retrieve
 *     responses:
 *       200:
 *         description: Item details with blockchain verification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifiedItem'
 *       404:
 *         description: Item not found
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
router.get('/:itemId', itemController.getItem);

/**
 * @swagger
 * /api/items/{itemId}/sync:
 *   post:
 *     summary: Sync item from blockchain
 *     description: Synchronize an item from the blockchain to the database
 *     tags: [Blockchain]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the item to sync
 *     responses:
 *       200:
 *         description: Item successfully synced
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 item:
 *                   $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found on blockchain
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
router.post('/:itemId/sync', itemController.syncItemFromBlockchain);

export default router; 