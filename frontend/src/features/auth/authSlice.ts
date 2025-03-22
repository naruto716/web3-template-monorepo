import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { walletService } from '@/services/web3/wallet';
import { authApi } from '@/services/api/auth';

interface AuthState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isAuthenticated: boolean;
  token: string | null;
  roles: string[];
  error: string | null;
  loading: boolean;
}

// Initialize state from localStorage if available
const initialState: AuthState = {
  address: localStorage.getItem('wallet_address'),
  isConnected: localStorage.getItem('wallet_connected') === 'true',
  isConnecting: false,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  token: localStorage.getItem('auth_token'),
  roles: JSON.parse(localStorage.getItem('auth_roles') || '[]'),
  error: null,
  loading: false,
};

// Async thunk for connecting wallet and authenticating with backend
export const connectWallet = createAsyncThunk(
  'auth/connectWallet',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // First connect the wallet
      const address = await walletService.connect();
      
      // Then authenticate with the backend
      dispatch(authenticateWithBackend(address));
      
      return { address };
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to connect wallet');
    }
  }
);

// Async thunk for authenticating with backend
export const authenticateWithBackend = createAsyncThunk(
  'auth/authenticateWithBackend',
  async (address: string, { rejectWithValue }) => {
    try {
      // Step 1: Request a challenge
      const challengeResponse = await authApi.requestChallenge(address);
      
      // Step 2: Sign the challenge
      const signature = await walletService.signMessage(challengeResponse.challenge);
      
      // Step 3: Verify the signature
      const authResponse = await authApi.verifySignature({
        walletAddress: address,
        signature,
        nonce: challengeResponse.nonce,
      });
      
      // Store auth data in localStorage
      localStorage.setItem('auth_token', authResponse.token);
      localStorage.setItem('auth_roles', JSON.stringify(authResponse.user.roles));
      
      return {
        token: authResponse.token,
        roles: authResponse.user.roles,
      };
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to authenticate with backend');
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
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.roles = [];
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_roles');
    },
  },
  extraReducers: (builder) => {
    builder
      // Connect wallet
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
      // Authenticate with backend
      .addCase(authenticateWithBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authenticateWithBackend.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.roles = action.payload.roles;
      })
      .addCase(authenticateWithBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Disconnect wallet
      .addCase(disconnectWallet.fulfilled, (state) => {
        state.isConnected = false;
        state.isAuthenticated = false;
        state.address = null;
        state.token = null;
        state.roles = [];
      });
  },
});

export const { setAddress, logout } = authSlice.actions;

export default authSlice.reducer; 