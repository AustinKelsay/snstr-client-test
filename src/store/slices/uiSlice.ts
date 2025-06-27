/**
 * UI slice for Redux store
 * Manages global UI state including modals, loading states, and user preferences
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Theme } from '@/types'

// UI state interface
export interface UIState {
  theme: Theme
  sidebarOpen: boolean
  isLoading: boolean
  loadingMessage?: string
  modals: {
    compose: boolean
    profile: boolean
    settings: boolean
    [key: string]: boolean
  }
  notifications: NotificationState[]
  connectionStatus: ConnectionStatus
}

// Notification interface
export interface NotificationState {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  timestamp: number
}

// Connection status
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error'

// Initial state
const initialState: UIState = {
  theme: 'dark', // Default to dark theme for cypherpunk aesthetic
  sidebarOpen: true,
  isLoading: false,
  loadingMessage: undefined,
  modals: {
    compose: false,
    profile: false,
    settings: false,
  },
  notifications: [],
  connectionStatus: 'disconnected',
}

// UI slice
export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload
    },
    toggleTheme: state => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
    },

    // Sidebar actions
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    toggleSidebar: state => {
      state.sidebarOpen = !state.sidebarOpen
    },

    // Loading actions
    setLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
      state.isLoading = action.payload.isLoading
      state.loadingMessage = action.payload.message
    },
    clearLoading: state => {
      state.isLoading = false
      state.loadingMessage = undefined
    },

    // Modal actions
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false
    },
    closeAllModals: state => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false
      })
    },

    // Notification actions
    addNotification: (
      state,
      action: PayloadAction<Omit<NotificationState, 'id' | 'timestamp'>>
    ) => {
      const notification: NotificationState = {
        ...action.payload,
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      }
      state.notifications.push(notification)

      // Auto-remove after duration (default 5 seconds)
      const duration = notification.duration || 5000
      if (duration > 0) {
        setTimeout(() => {
          // This would normally be handled by middleware in a production app
          // For now, we'll rely on manual cleanup
        }, duration)
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearAllNotifications: state => {
      state.notifications = []
    },

    // Connection status actions
    setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.connectionStatus = action.payload
    },
  },
})

// Helper action creators for common notification types
export const showSuccess = (title: string, message?: string, duration?: number) =>
  uiSlice.actions.addNotification({ type: 'success', title, message, duration })

export const showError = (title: string, message?: string, duration?: number) =>
  uiSlice.actions.addNotification({ type: 'error', title, message, duration })

export const showWarning = (title: string, message?: string, duration?: number) =>
  uiSlice.actions.addNotification({ type: 'warning', title, message, duration })

export const showInfo = (title: string, message?: string, duration?: number) =>
  uiSlice.actions.addNotification({ type: 'info', title, message, duration })

// Export actions
export const {
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  setLoading,
  clearLoading,
  openModal,
  closeModal,
  closeAllModals,
  addNotification,
  removeNotification,
  clearAllNotifications,
  setConnectionStatus,
} = uiSlice.actions

// Export reducer as default
export default uiSlice.reducer
