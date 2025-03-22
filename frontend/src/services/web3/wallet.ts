import { ethers } from 'ethers';

// This file will handle wallet connections and interactions
export interface WalletService {
  connect: () => Promise<string>;
  disconnect: () => void;
  getAddress: () => string | null;
  isConnected: () => boolean;
  getProvider: () => ethers.BrowserProvider | null;
  getSigner: () => Promise<ethers.Signer | null>;
  signMessage: (message: string) => Promise<string>;
}

// Implementation with real wallet connection using ethers v6
export const walletService: WalletService = {
  // Connect to MetaMask wallet
  connect: async () => {
    try {
      // Request access to the user's MetaMask account
      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }

      // Create a provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length === 0) {
        throw new Error("No accounts available");
      }
      
      // Check if we're on Sepolia network (chainId 11155111)
      const chainId = await provider.send("eth_chainId", []);
      
      // If not on Sepolia, request to switch
      if (chainId !== "0xaa36a7") { // 0xaa36a7 is 11155111 in hex
        try {
          await provider.send("wallet_switchEthereumChain", [{ chainId: "0xaa36a7" }]);
        } catch (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          switchError: any
        ) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            await provider.send("wallet_addEthereumChain", [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia Testnet",
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "ETH",
                  decimals: 18
                },
                rpcUrls: ["https://sepolia.infura.io/v3/"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"]
              }
            ]);
          } else {
            throw switchError;
          }
        }
      }
      
      // Store the provider and address in localStorage for persistence
      localStorage.setItem('wallet_connected', 'true');
      localStorage.setItem('wallet_address', accounts[0]);
      
      return accounts[0];
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  },
  
  // Disconnect wallet
  disconnect: () => {
    localStorage.removeItem('wallet_connected');
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_roles');
  },
  
  // Get the current connected address
  getAddress: () => {
    return localStorage.getItem('wallet_address');
  },
  
  // Check if wallet is connected
  isConnected: () => {
    return localStorage.getItem('wallet_connected') === 'true';
  },
  
  // Get ethers provider
  getProvider: () => {
    if (!window.ethereum) {
      return null;
    }
    
    return new ethers.BrowserProvider(window.ethereum);
  },
  
  // Get signer for transactions
  getSigner: async () => {
    try {
      const provider = walletService.getProvider();
      if (!provider) {
        return null;
      }
      
      return await provider.getSigner();
    } catch (error) {
      console.error("Error getting signer:", error);
      return null;
    }
  },
  
  // Sign a message using the connected wallet
  signMessage: async (message: string) => {
    try {
      const signer = await walletService.getSigner();
      if (!signer) {
        throw new Error("No signer available. Connect wallet first.");
      }
      
      return await signer.signMessage(message);
    } catch (error) {
      console.error("Error signing message:", error);
      throw error;
    }
  }
};

// Add Ethereum window type
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any;
  }
} 