import { Request, Response } from 'express';
import * as itemService from '../../services/itemService';
import { getItemFromBlockchain, getItemsForSaleFromBlockchain } from '../../blockchain/contracts';
import logger from '../../utils/logger';

/**
 * Get a single item with blockchain verification
 */
export const getItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    
    if (!itemId) {
      res.status(400).json({ error: 'Item ID is required' });
      return;
    }
    
    const verifiedItem = await itemService.getVerifiedItem(itemId);
    
    if (!verifiedItem) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    
    res.status(200).json(verifiedItem);
  } catch (error) {
    logger.error('Error in getItem controller:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
};

/**
 * Get all items (optionally filtered)
 */
export const getAllItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { seller, status } = req.query;
    const filters: Record<string, any> = {};
    
    if (seller) filters.seller = seller;
    if (status) filters.status = status;
    
    const items = await itemService.getAllItems(filters);
    res.status(200).json(items);
  } catch (error) {
    logger.error('Error in getAllItems controller:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

/**
 * Get items directly from blockchain (bypass database)
 */
export const getBlockchainItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await getItemsForSaleFromBlockchain();
    res.status(200).json(items);
  } catch (error) {
    logger.error('Error in getBlockchainItems controller:', error);
    res.status(500).json({ error: 'Failed to fetch items from blockchain' });
  }
};

/**
 * Sync a specific item from blockchain to database
 */
export const syncItemFromBlockchain = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    
    if (!itemId) {
      res.status(400).json({ error: 'Item ID is required' });
      return;
    }
    
    // Get item from blockchain
    const chainItem = await getItemFromBlockchain(itemId);
    
    // Get current database item if it exists
    const dbItem = await itemService.getItem(itemId);
    
    // Convert blockchain item to database format
    const formattedItem = {
      itemId: chainItem.id,
      name: chainItem.name,
      description: chainItem.description,
      seller: chainItem.seller,
      price: chainItem.price,
      status: chainItem.isForSale ? 'listed' : 'sold'
    };
    
    let result;
    
    // Update or create item
    if (dbItem) {
      // Preserve existing fields that aren't in the blockchain
      const updateData = {
        ...formattedItem,
        imageUrl: dbItem.imageUrl,
        buyer: dbItem.buyer,
      };
      
      result = await itemService.updateItemMetadata(itemId, updateData);
    } else {
      // Create new item in database from blockchain data
      const newItem = new (await import('../../models/Item')).Item({
        ...formattedItem,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      result = await newItem.save();
    }
    
    res.status(200).json({
      message: 'Item synced successfully',
      item: result
    });
  } catch (error) {
    logger.error('Error in syncItemFromBlockchain controller:', error);
    res.status(500).json({ error: 'Failed to sync item from blockchain' });
  }
}; 