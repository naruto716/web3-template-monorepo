import { ethers } from 'ethers';
import { getProvider } from '../blockchain/provider';
import { getMarketplaceContract } from '../blockchain/contracts';
import { Transaction, ITransaction } from '../models/Transaction';
import { Item } from '../models/Item';
import logger from '../utils/logger';

/**
 * Get transaction status
 */
export const getTransactionStatus = async (txHash: string): Promise<ITransaction> => {
  try {
    // Check if transaction is already in database
    let tx = await Transaction.findOne({ hash: txHash });
    
    // If no transaction in database yet, create one
    if (!tx) {
      tx = new Transaction({
        hash: txHash,
        status: 'pending',
        createdAt: new Date()
      });
    }
    
    // Get provider and contract
    const provider = getProvider();
    const contract = getMarketplaceContract();
    
    // Get receipt from blockchain
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      // Still pending
      tx.status = 'pending';
    } else {
      // Transaction processed
      tx.blockNumber = receipt.blockNumber;
      tx.gasUsed = receipt.gasUsed.toString();
      tx.status = receipt.status === 1 ? 'success' : 'failed';
      
      // Get block timestamp
      const block = await provider.getBlock(receipt.blockNumber);
      if (block && block.timestamp) {
        tx.timestamp = new Date(Number(block.timestamp) * 1000);
      }
      
      // Parse logs for event data
      for (const log of receipt.logs) {
        try {
          // We need to handle parsing in a way that works with ethers v6
          const parsedLog = contract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          });
          
          if (parsedLog && parsedLog.name === 'ItemSold') {
            tx.eventType = 'ItemSold';
            tx.itemId = parsedLog.args[0].toString(); // itemId
            tx.seller = parsedLog.args[1];            // seller
            tx.buyer = parsedLog.args[2];             // buyer
            tx.price = ethers.formatEther(parsedLog.args[3]); // price
            
            // Update the item status as well
            await Item.markAsSold(tx.itemId as string, tx.buyer as string);
          } else if (parsedLog && parsedLog.name === 'ItemListed') {
            tx.eventType = 'ItemListed';
            tx.itemId = parsedLog.args[0].toString(); // itemId
            tx.seller = parsedLog.args[1];            // seller
            // Item name is args[2], price is args[3]
          }
        } catch (parseError) {
          // Not a log we can parse, just continue
        }
      }
    }
    
    // Save updated transaction
    tx.updatedAt = new Date();
    await tx.save();
    
    return tx;
  } catch (error) {
    logger.error(`Failed to get transaction status for ${txHash}:`, error);
    throw error;
  }
}; 