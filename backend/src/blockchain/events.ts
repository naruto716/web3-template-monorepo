import { ethers } from 'ethers';
import { getMarketplaceContract } from './contracts';
import { Item } from '../models/Item';
import { Transaction } from '../models/Transaction';
import logger from '../utils/logger';

/**
 * Set up blockchain event listeners
 */
export const setupEventListeners = (): void => {
  const contract = getMarketplaceContract();
  
  // Listen for ItemListed events
  contract.on('ItemListed', async (
    itemId: ethers.BigNumberish, 
    seller: string, 
    name: string, 
    price: ethers.BigNumberish, 
    event: ethers.EventLog
  ) => {
    logger.info(`ItemListed event detected for item ${itemId}`);
    
    try {
      // Save/update item in database
      await Item.findOneAndUpdate(
        { itemId: itemId.toString() },
        {
          $set: {
            itemId: itemId.toString(),
            seller,
            name,
            price: ethers.formatEther(price),
            status: 'listed',
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true, new: true }
      );
      
      // Record transaction
      await Transaction.create({
        hash: event.transactionHash,
        status: 'success',
        blockNumber: event.blockNumber,
        eventType: 'ItemListed',
        itemId: itemId.toString(),
        seller
      });
      
      logger.info(`Successfully processed ItemListed event for item ${itemId}`);
    } catch (error) {
      logger.error(`Failed to process ItemListed event:`, error);
    }
  });
  
  // Listen for ItemSold events
  contract.on('ItemSold', async (
    itemId: ethers.BigNumberish, 
    seller: string, 
    buyer: string, 
    price: ethers.BigNumberish, 
    event: ethers.EventLog
  ) => {
    logger.info(`ItemSold event detected for item ${itemId}`);
    
    try {
      // Update item status in database
      await Item.markAsSold(itemId.toString(), buyer);
      
      // Record transaction
      await Transaction.create({
        hash: event.transactionHash,
        status: 'success',
        blockNumber: event.blockNumber,
        eventType: 'ItemSold',
        itemId: itemId.toString(),
        seller,
        buyer,
        price: ethers.formatEther(price)
      });
      
      logger.info(`Successfully processed ItemSold event for item ${itemId}`);
    } catch (error) {
      logger.error(`Failed to process ItemSold event:`, error);
    }
  });
  
  logger.info('Blockchain event listeners have been set up');
}; 