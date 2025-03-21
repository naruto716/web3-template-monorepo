import { ethers } from 'ethers';
import logger from '../utils/logger';

let provider: ethers.JsonRpcProvider | null = null;

/**
 * Get Ethereum provider, creating it if it doesn't exist
 */
export const getProvider = (): ethers.JsonRpcProvider => {
  if (!provider) {
    const rpcUrl = process.env.ETHEREUM_RPC_URL;
    if (!rpcUrl) {
      throw new Error('ETHEREUM_RPC_URL not defined in environment variables');
    }
    
    provider = new ethers.JsonRpcProvider(rpcUrl);
    logger.info('Ethereum provider initialized');
  }
  
  return provider;
}; 