import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import marketplaceReducer from '@/features/marketplace/marketplaceSlice';
import talentReducer from '@/features/talent/talentSlice';

// Create the store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    marketplace: marketplaceReducer,
    talent: talentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 