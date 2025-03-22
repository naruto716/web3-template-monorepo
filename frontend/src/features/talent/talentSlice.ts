import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { talentApi, TalentSearchParams, TalentSearchResponse, Talent } from '@/services/api/talent';

// Define the initial state
interface TalentState {
  talents: Talent[];
  selectedTalent: Talent | null;
  loading: boolean;
  error: string | null;
  totalResults: number;
  currentPage: number;
  limit: number;
  searchParams: TalentSearchParams;
}

const initialState: TalentState = {
  talents: [],
  selectedTalent: null,
  loading: false,
  error: null,
  totalResults: 0,
  currentPage: 1,
  limit: 10,
  searchParams: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
};

// Async thunks
export const searchTalents = createAsyncThunk(
  'talent/searchTalents',
  async (params: TalentSearchParams, { rejectWithValue }) => {
    try {
      // Merge with existing search params to maintain pagination state
      return await talentApi.searchTalents(params);
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const getTalentById = createAsyncThunk(
  'talent/getTalentById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await talentApi.getTalentById(id);
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Create the slice
const talentSlice = createSlice({
  name: 'talent',
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<TalentSearchParams>) => {
      state.searchParams = {
        ...state.searchParams,
        ...action.payload,
        // Reset page to 1 when search params change
        page: action.payload.page || 1
      };
    },
    clearTalents: (state) => {
      state.talents = [];
      state.totalResults = 0;
      state.currentPage = 1;
    },
    clearSelectedTalent: (state) => {
      state.selectedTalent = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle searchTalents
      .addCase(searchTalents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchTalents.fulfilled, (state, action: PayloadAction<TalentSearchResponse>) => {
        state.loading = false;
        state.talents = action.payload.results;
        state.totalResults = action.payload.total;
        state.currentPage = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(searchTalents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle getTalentById
      .addCase(getTalentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTalentById.fulfilled, (state, action: PayloadAction<Talent>) => {
        state.loading = false;
        state.selectedTalent = action.payload;
      })
      .addCase(getTalentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions and reducer
export const { setSearchParams, clearTalents, clearSelectedTalent } = talentSlice.actions;
export default talentSlice.reducer; 