import { ethers } from 'ethers';
import SimpleMarketplaceABI from './SimpleMarketplace.json';

// Contract address
const MARKETPLACE_ADDRESS = SimpleMarketplaceABI.address;

// Create read-only contract instance
export const getMarketplaceContract = (provider: ethers.Provider) => {
  return new ethers.Contract(
    MARKETPLACE_ADDRESS,
    SimpleMarketplaceABI.abi,
    provider
  );
};

// Create contract with signer for transactions
export const getMarketplaceContractWithSigner = async (
  provider: ethers.BrowserProvider | ethers.JsonRpcProvider
) => {
  const signer = await provider.getSigner();
  return new ethers.Contract(
    MARKETPLACE_ADDRESS,
    SimpleMarketplaceABI.abi,
    signer
  );
}; 