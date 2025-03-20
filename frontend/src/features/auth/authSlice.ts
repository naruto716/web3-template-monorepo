import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { walletService } from '@/services/web3/wallet';

interface AuthState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

// Initialize state from localStorage if available
const initialState: AuthState = {
  address: localStorage.getItem('wallet_address'),
  isConnected: localStorage.getItem('wallet_connected') === 'true',
  isConnecting: false,
  error: null,
};

// Async thunk for connecting wallet
export const connectWallet = createAsyncThunk(
  'auth/connectWallet',
  async (_, { rejectWithValue }) => {
    try {
      const address = await walletService.connect();
      return { address };
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to connect wallet');
    }
  }
);

// Async thunk for disconnecting wallet
export const disconnectWallet = createAsyncThunk(
  'auth/disconnectWallet',
  async () => {
    walletService.disconnect();
    return {};
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<string | null>) => {
      state.address = action.payload;
      state.isConnected = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isConnected = true;
        state.address = action.payload.address;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload as string;
      })
      .addCase(disconnectWallet.fulfilled, (state) => {
        state.isConnected = false;
        state.address = null;
      });
  },
});

export const { setAddress } = authSlice.actions;

export default authSlice.reducer; 