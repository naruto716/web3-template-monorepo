import { ethers } from 'ethers';
import SimpleMarketplaceABI from '../TestContracts/SimpleMarketplace.json';
import TalentsABI from './Talents.json';
import SkillNFTABI from './SkillNFT_And_Escrow.json';

// Contract addresses
const MARKETPLACE_ADDRESS = SimpleMarketplaceABI.address;
const TALENTS_ADDRESS = TalentsABI.address;
const SKILLNFT_ADDRESS = SkillNFTABI.address;

// MARKETPLACE CONTRACT - Original functions (keep these)
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

// TALENTS CONTRACT
// Read-only contract instances
export const getTalentsContract = (provider: ethers.Provider) => {
  return new ethers.Contract(
    TALENTS_ADDRESS,
    TalentsABI.abi,
    provider
  );
};

export const getSkillNFTContract = (provider: ethers.Provider) => {
  return new ethers.Contract(
    SKILLNFT_ADDRESS,
    SkillNFTABI.abi,
    provider
  );
};

// Contract instances with signer for transactions
export const getTalentsContractWithSigner = async (
  provider: ethers.BrowserProvider | ethers.JsonRpcProvider
) => {
  const signer = await provider.getSigner();
  return new ethers.Contract(
    TALENTS_ADDRESS,
    TalentsABI.abi,
    signer
  );
};

export const getSkillNFTContractWithSigner = async (
  provider: ethers.BrowserProvider | ethers.JsonRpcProvider
) => {
  const signer = await provider.getSigner();
  return new ethers.Contract(
    SKILLNFT_ADDRESS,
    SkillNFTABI.abi,
    signer
  );
};

// Talents contract functions
export const createFreelancer = async (
  provider: ethers.BrowserProvider | ethers.JsonRpcProvider,
  name: string,
  profileId: string
) => {
  const contract = await getTalentsContractWithSigner(provider);
  const tx = await contract.createFreelancer(name, profileId);
  return tx.wait();
};

export const getFreelancer = async (
  provider: ethers.Provider,
  walletAddress: string
) => {
  const contract = getTalentsContract(provider);
  return contract.getFreelancer(walletAddress);
};

// SkillNFT contract functions
export const createOfferNFT = async (
  provider: ethers.BrowserProvider | ethers.JsonRpcProvider,
  company: string,
  skillName: string,
  payment: string, // in wei
  startDate: number, // unix timestamp
  endDate: number // unix timestamp
): Promise<{ tokenId: string; transactionHash: string }> => {
  // 1. Get the contract with signer
  const contract = await getSkillNFTContractWithSigner(provider);

  // 2. Send the transaction to create the NFT
  const tx = await contract.createOfferNFT(company, skillName, payment, startDate, endDate);

  // 3. Wait for the transaction to be mined
  const receipt = await tx.wait();

  // 4. Parse the logs to find the `OfferNFTCreated` event
  let tokenId: string | null = null;

  for (const log of receipt.logs) {
    try {
      // Attempt to parse the log with the contract interface
      const parsedLog = contract.interface.parseLog(log);

      // Check if it's the OfferNFTCreated event
      if (parsedLog && parsedLog.name === "OfferNFTCreated") {
        // Convert the tokenId to a string
        tokenId = parsedLog.args.tokenId.toString();
        break; // We found our event, so we can stop parsing
      }
    } catch {
      // If parseLog fails, it just means this log isn't from our contract
    }
  }

  if (!tokenId) {
    throw new Error("OfferNFTCreated event not found in transaction logs");
  }

  // 5. Return the tokenId and transaction hash
  return {
    tokenId,
    transactionHash: tx.hash,
  };
};


export const getOffer = async (
  provider: ethers.Provider,
  tokenId: number
) => {
  const contract = getSkillNFTContract(provider);
  return contract.getOffer(tokenId);
};

export const tradeOfferNFT = async (
  provider: ethers.BrowserProvider | ethers.JsonRpcProvider,
  tokenId: number,
  paymentAmount: string // in wei
) => {
  const contract = await getSkillNFTContractWithSigner(provider);
  const tx = await contract.tradeOfferNFT(tokenId, { value: paymentAmount });
  return tx.wait();
};

export const releasePayment = async (
  provider: ethers.BrowserProvider | ethers.JsonRpcProvider,
  tokenId: number
) => {
  const contract = await getSkillNFTContractWithSigner(provider);
  const tx = await contract.releasePayment(tokenId);
  return tx.wait();
};

// Helper for converting timestamps
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString();
};

// Helper for formatting ether values
export const formatEtherValue = (weiValue: string): string => {
  try {
    const ethValue = parseFloat(ethers.formatEther(weiValue));
    return `${ethValue.toFixed(4)} ETH`;
  } catch (error) {
    console.error("Error formatting ether value:", error);
    return "0 ETH";
  }
}; 