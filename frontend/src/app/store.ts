import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import marketplaceReducer from '@/features/marketplace/marketplaceSlice';

// Create the store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    marketplace: marketplaceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 