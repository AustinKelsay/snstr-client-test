/**
 * Redux store configuration and setup
 * Configures the main application store with Redux Toolkit
 */

import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'

// Import slices
import authSlice from './slices/authSlice'
import uiSlice from './slices/uiSlice'
import postsSlice from './slices/postsSlice'

// Import middleware
import { notificationMiddleware } from './middleware'

/**
 * Configure the Redux store with all slices and middleware
 */
export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    posts: postsSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(notificationMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
})

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Export typed hooks for use throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Export the store as default
export default store
