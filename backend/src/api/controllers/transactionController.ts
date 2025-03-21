import { Request, Response } from 'express';
import { Transaction } from '../../models/Transaction';
import { getProvider } from '../../blockchain/provider';
import { getMarketplaceContract } from '../../blockchain/contracts';
import { initializeEventListeners } from '../../blockchain/eventListeners';
import logger from '../../utils/logger';

// Declare global namespace for the isListening property
declare global {
  var isListening: boolean;
}

/**
 * Get transaction details by hash
 */
export const getTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hash } = req.params;
    
    if (!hash) {
      res.status(400).json({ error: 'Transaction hash is required' });
      return;
    }
    
    // Check if transaction exists in database
    const dbTransaction = await Transaction.findOne({ hash });
    
    if (!dbTransaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    
    // If transaction is pending, try to get updated info from blockchain
    if (dbTransaction.status === 'pending') {
      try {
        const provider = getProvider();
        const receipt = await provider.getTransactionReceipt(hash);
        
        if (receipt) {
          // Update transaction status in database
          dbTransaction.status = receipt.status ? 'success' : 'failed';
          dbTransaction.blockNumber = receipt.blockNumber;
          dbTransaction.gasUsed = receipt.gasUsed.toString();
          
          const block = await provider.getBlock(receipt.blockNumber);
          if (block && block.timestamp) {
            dbTransaction.timestamp = new Date(Number(block.timestamp) * 1000);
          }
          
          dbTransaction.updatedAt = new Date();
          await dbTransaction.save();
        }
      } catch (error) {
        logger.error(`Failed to fetch transaction receipt for ${hash}:`, error);
        // Continue with existing data
      }
    }
    
    res.status(200).json(dbTransaction);
  } catch (error) {
    logger.error('Error in getTransaction controller:', error);
    res.status(500).json({ error: 'Failed to fetch transaction details' });
  }
};

/**
 * Record a new transaction
 */
export const recordTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hash, eventType, itemId, seller, buyer, price } = req.body;
    
    if (!hash) {
      res.status(400).json({ error: 'Transaction hash is required' });
      return;
    }
    
    // Check if transaction already exists
    const existingTransaction = await Transaction.findOne({ hash });
    
    if (existingTransaction) {
      res.status(409).json({ 
        error: 'Transaction already recorded',
        transaction: existingTransaction
      });
      return;
    }
    
    // Create new transaction
    const newTransaction = new Transaction({
      hash,
      status: 'pending',
      eventType,
      itemId,
      seller,
      buyer,
      price,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedTransaction = await newTransaction.save();
    
    res.status(201).json(savedTransaction);
  } catch (error) {
    logger.error('Error in recordTransaction controller:', error);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
};

/**
 * Get all transactions with optional filters
 */
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId, seller, buyer, status } = req.query;
    const filters: Record<string, any> = {};
    
    if (itemId) filters.itemId = itemId;
    if (seller) filters.seller = seller;
    if (buyer) filters.buyer = buyer;
    if (status) filters.status = status;
    
    const transactions = await Transaction.find(filters)
      .sort({ createdAt: -1 });
    
    res.status(200).json(transactions);
  } catch (error) {
    logger.error('Error in getTransactions controller:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

/**
 * Listen for marketplace events and record them
 * This endpoint is provided for manual initialization if needed,
 * but event listeners are automatically initialized on server start
 */
export const listenForEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    initializeEventListeners();
    res.status(200).json({ message: 'Blockchain event listeners initialized' });
  } catch (error) {
    logger.error('Error in listenForEvents controller:', error);
    res.status(500).json({ error: 'Failed to initialize blockchain event listeners' });
  }
}; 