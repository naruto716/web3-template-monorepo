import { getMarketplaceContract } from './contracts';
import { Transaction } from '../models/Transaction';
import logger from '../utils/logger';

// Track if listeners are already initialized
let isInitialized = false;

/**
 * Custom replacer for JSON.stringify to handle BigInt
 */
const jsonReplacer = (key: string, value: any): any => {
  // Convert BigInt to string
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

/**
 * Initialize blockchain event listeners
 */
export const initializeEventListeners = (): void => {
  if (isInitialized) {
    logger.info('Blockchain event listeners already initialized');
    return;
  }

  try {
    const contract = getMarketplaceContract();
    logger.info('Initializing blockchain event listeners');

    // ItemListed event
    contract.on('ItemListed', async (itemId, seller, price, event) => {
      logger.info(`ItemListed event: Item ${itemId} listed by ${seller} for ${price}`);
      
      try {
        // In ethers v6, log basic event info first
        logger.info(`Event object type: ${typeof event}`);
        
        try {
          // Use custom replacer to handle BigInt
          const eventKeys = Object.keys(event || {});
          logger.info(`Event object keys: ${eventKeys.join(', ')}`);
          logger.info(`Event object: ${JSON.stringify(event, jsonReplacer, 2)}`);
        } catch (jsonError) {
          logger.error(`Error stringifying event: ${jsonError}`);
        }
        
        // Try to access potential properties based on ethers v6 structure
        const possibleTxHash = event?.transactionHash || event?.transaction?.hash || 
                               event?.log?.transactionHash || event?.hash;
        
        logger.info(`Possible transaction hash: ${possibleTxHash}`);
        
        if (!possibleTxHash) {
          logger.error('Could not find transaction hash in event');
          return;
        }
        
        // Record transaction
        const newTransaction = new Transaction({
          hash: possibleTxHash,
          status: 'success',
          blockNumber: event?.blockNumber || event?.log?.blockNumber || null,
          eventType: 'ItemListed',
          itemId: itemId.toString(),
          seller,
          price: typeof price === 'bigint' ? price.toString() : price.toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await newTransaction.save();
        logger.info(`Transaction saved with hash: ${possibleTxHash}`);
      } catch (error) {
        logger.error(`Failed to save ItemListed transaction: ${error}`);
      }
    });
    
    // ItemSold event (update with similar approach)
    contract.on('ItemSold', async (itemId, seller, buyer, price, event) => {
      logger.info(`ItemSold event: Item ${itemId} sold to ${buyer} for ${price}`);
      
      try {
        // Try to access potential properties based on ethers v6 structure
        const possibleTxHash = event?.transactionHash || event?.transaction?.hash || 
                               event?.log?.transactionHash || event?.hash;
        
        logger.info(`Possible transaction hash: ${possibleTxHash}`);
        
        if (!possibleTxHash) {
          logger.error('Could not find transaction hash in event');
          return;
        }
        
        // Record transaction
        const newTransaction = new Transaction({
          hash: possibleTxHash,
          status: 'success',
          blockNumber: event?.blockNumber || event?.log?.blockNumber || null,
          eventType: 'ItemSold',
          itemId: itemId.toString(),
          seller,
          buyer,
          price: typeof price === 'bigint' ? price.toString() : price.toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await newTransaction.save();
        logger.info(`Transaction saved with hash: ${possibleTxHash}`);
      } catch (error) {
        logger.error(`Failed to save ItemSold transaction: ${error}`);
      }
    });

    isInitialized = true;
    logger.info('Blockchain event listeners initialized successfully');
  } catch (error) {
    logger.error(`Failed to initialize blockchain event listeners: ${error}`);
  }
}; 