import { ethers } from 'ethers';
import { getProvider } from './provider';
import marketplaceABI from '../abis/simplemarketplace.json';
import logger from '../utils/logger';

// Define BlockchainItem interface
export interface BlockchainItem {
  id: string;
  seller: string;
  name: string;
  description: string;
  price: string;
  isForSale: boolean;
}

let marketplaceContract: ethers.Contract | null = null;

/**
 * Get Marketplace contract instance, creating it if it doesn't exist
 */
export const getMarketplaceContract = (): ethers.Contract => {
  if (!marketplaceContract) {
    const provider = getProvider();
    const contractAddress = process.env.CONTRACT_ADDRESS;
    
    if (!contractAddress) {
      throw new Error('CONTRACT_ADDRESS not defined in environment variables');
    }
    
    marketplaceContract = new ethers.Contract(
      contractAddress,
      marketplaceABI.abi,
      provider
    );
    
    logger.info(`Marketplace contract initialized at ${contractAddress}`);
  }
  
  return marketplaceContract;
};

/**
 * Get item data from blockchain
 */
export const getItemFromBlockchain = async (itemId: string): Promise<BlockchainItem> => {
  try {
    const contract = getMarketplaceContract();
    const item = await contract.getItem(itemId);
    
    return {
      id: itemId,
      seller: item.seller,
      name: item.name,
      description: item.description,
      price: ethers.formatEther(item.price),
      isForSale: item.isForSale
    };
  } catch (error) {
    logger.error(`Failed to get item ${itemId} from blockchain:`, error);
    throw error;
  }
};

/**
 * Get all items for sale from blockchain
 */
export const getItemsForSaleFromBlockchain = async (): Promise<BlockchainItem[]> => {
  try {
    const contract = getMarketplaceContract();
    const itemIds = await contract.getItemsForSale();
    
    // Fetch details for each item
    const itemPromises = itemIds.map((id: ethers.BigNumberish) => 
      getItemFromBlockchain(id.toString())
    );
    
    return await Promise.all(itemPromises);
  } catch (error) {
    logger.error('Failed to get items for sale from blockchain:', error);
    throw error;
  }
}; 