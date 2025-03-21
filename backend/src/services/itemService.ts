import { Item, IItem } from '../models/Item';
import { getItemFromBlockchain, BlockchainItem } from '../blockchain/contracts';
import logger from '../utils/logger';

/**
 * Interface for item with blockchain verification
 */
export interface VerifiedItem extends IItem {
  blockchainState: {
    currentOwner: string;
    currentPrice: string;
    isForSale: boolean;
    isSynced: boolean;
  };
}

/**
 * Get item by ID (from database or blockchain)
 */
export const getItem = async (itemId: string): Promise<IItem | null> => {
  try {
    // Try database first
    let item = await Item.findByItemId(itemId);
    
    // Fallback to blockchain
    if (!item) {
      try {
        const chainItem = await getItemFromBlockchain(itemId);
        
        // Save to database
        item = new Item({
          itemId: chainItem.id,
          name: chainItem.name,
          description: chainItem.description,
          seller: chainItem.seller,
          price: chainItem.price,
          status: chainItem.isForSale ? 'listed' : 'sold',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await item.save();
      } catch (error) {
        logger.error(`Failed to get item ${itemId} from blockchain:`, error);
        return null;
      }
    }
    
    return item;
  } catch (error) {
    logger.error(`Failed to get item ${itemId}:`, error);
    throw error;
  }
};

/**
 * Get all items with optional filters
 */
export const getAllItems = async (filters: Record<string, any> = {}): Promise<IItem[]> => {
  try {
    return await Item.find(filters).sort({ createdAt: -1 });
  } catch (error) {
    logger.error('Failed to get items:', error);
    throw error;
  }
};

/**
 * Get item with blockchain verification
 */
export const getVerifiedItem = async (itemId: string): Promise<VerifiedItem | null> => {
  try {
    // Get database version
    const dbItem = await getItem(itemId);
    
    if (!dbItem) {
      return null;
    }
    
    // Get current blockchain state
    let chainItem: BlockchainItem;
    try {
      chainItem = await getItemFromBlockchain(itemId);
    } catch (error) {
      logger.error(`Failed to get blockchain state for item ${itemId}:`, error);
      throw new Error('Failed to verify item with blockchain');
    }
    
    // Return combined data
    const verifiedItem = dbItem.toObject() as VerifiedItem;
    verifiedItem.blockchainState = {
      currentOwner: chainItem.seller,
      currentPrice: chainItem.price,
      isForSale: chainItem.isForSale,
      isSynced: dbItem.status === (chainItem.isForSale ? 'listed' : 'sold')
    };
    
    return verifiedItem;
  } catch (error) {
    logger.error(`Failed to get verified item ${itemId}:`, error);
    throw error;
  }
};

/**
 * Update item metadata
 */
export const updateItemMetadata = async (
  itemId: string, 
  metadata: { imageUrl?: string }
): Promise<IItem | null> => {
  try {
    const update = {
      updatedAt: new Date(),
      ...metadata
    };
    
    return await Item.findOneAndUpdate(
      { itemId }, 
      { $set: update },
      { new: true }
    );
  } catch (error) {
    logger.error(`Failed to update item ${itemId} metadata:`, error);
    throw error;
  }
}; 