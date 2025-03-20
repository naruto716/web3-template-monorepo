import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { walletService } from '@/services/web3/wallet';
import { getMarketplaceContract, getMarketplaceContractWithSigner } from '@/services/web3/contracts';

// Define types for marketplace items
export interface MarketplaceItem {
  id: number;
  name: string;
  description: string;
  seller: string;
  price: string;
  isForSale: boolean;
}

interface MarketplaceState {
  items: MarketplaceItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MarketplaceState = {
  items: [],
  isLoading: false,
  error: null,
};

// Function to transform contract item data to our format
const transformContractItem = (
  id: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
): MarketplaceItem => {
  console.log('Transforming item:', item);
  try {
    return {
      id,
      name: item.name,
      description: item.description,
      seller: item.seller,
      price: ethers.formatEther(item.price) + ' ETH',
      isForSale: item.isForSale,
    };
  } catch (error) {
    console.error('Error transforming item:', error);
    // Return a default item if transformation fails
    return {
      id,
      name: 'Error: Unable to load item',
      description: 'There was an error loading this item.',
      seller: '0x0000000000000000000000000000000000000000',
      price: '0 ETH',
      isForSale: false,
    };
  }
};

// Fetch items from the smart contract
export const fetchItems = createAsyncThunk(
  'marketplace/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const provider = walletService.getProvider();
      if (!provider) {
        throw new Error('No provider available');
      }

      const contract = getMarketplaceContract(provider);
      
      // Get item count from contract
      const itemCount = await contract.itemCount();
      const count = Number(itemCount);
      
      console.log(`Found ${count} items in the marketplace`);
      
      // Fetch details for each item
      const items: MarketplaceItem[] = [];
      
      for (let i = 1; i <= count; i++) {
        try {
          const item = await contract.getItem(i);
          console.log(`Item ${i}:`, item);
          items.push(transformContractItem(i, item));
        } catch (err) {
          console.error(`Error fetching item ${i}:`, err);
          // Continue with other items even if one fails
        }
      }
      
      return { items };
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
      let errorMessage = 'Failed to fetch marketplace items';
      
      if (error instanceof Error) {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Buy an item from the marketplace
export const buyItem = createAsyncThunk(
  'marketplace/buyItem',
  async (itemId: number, { rejectWithValue }) => {
    try {
      const provider = walletService.getProvider();
      if (!provider) {
        throw new Error('No provider available');
      }
      
      // Get item details first
      const contract = getMarketplaceContract(provider);
      const item = await contract.getItem(itemId);
      
      // Get contract with signer
      const contractWithSigner = await getMarketplaceContractWithSigner(provider);
      
      // Buy the item
      const tx = await contractWithSigner.buyItem(itemId, {
        value: item.price, // Send the exact amount required
      });
      
      // Wait for transaction to be mined
      await tx.wait();
      
      return { itemId };
    } catch (error) {
      console.error('Error buying item:', error);
      return rejectWithValue((error as Error).message || 'Failed to buy item');
    }
  }
);

// List a new item in the marketplace
export const listItem = createAsyncThunk(
  'marketplace/listItem',
  async (
    { name, description, price }: { name: string; description: string; price: string },
    { rejectWithValue }
  ) => {
    try {
      const provider = walletService.getProvider();
      if (!provider) {
        throw new Error('No provider available');
      }
      
      // Get contract with signer
      const contractWithSigner = await getMarketplaceContractWithSigner(provider);
      
      // Convert price from ETH to wei
      const priceInWei = ethers.parseEther(price);
      
      // List the item
      const tx = await contractWithSigner.listItem(name, description, priceInWei);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Refresh items after listing
      return { success: true };
    } catch (error) {
      console.error('Error listing item:', error);
      return rejectWithValue((error as Error).message || 'Failed to list item');
    }
  }
);

export const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    // Add any synchronous actions here
  },
  extraReducers: (builder) => {
    builder
      // Fetch items
      .addCase(fetchItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Buy item
      .addCase(buyItem.fulfilled, (state, action) => {
        const { itemId } = action.payload;
        // Update the item to mark it as no longer for sale
        const item = state.items.find(item => item.id === itemId);
        if (item) {
          item.isForSale = false;
        }
      });
  },
});

export default marketplaceSlice.reducer; 