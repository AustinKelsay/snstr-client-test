/**
 * Selectors for UI state
 * Provides memoized selectors for accessing UI state from the Redux store
 */

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import type { NotificationState } from '../slices/uiSlice'

// Base selectors
export const selectUIState = (state: RootState) => state.ui

// Theme selectors
export const selectTheme = createSelector([selectUIState], ui => ui.theme)

export const selectIsDarkMode = createSelector([selectTheme], theme => theme === 'dark')

// Sidebar selectors
export const selectSidebarOpen = createSelector([selectUIState], ui => ui.sidebarOpen)

// Loading selectors
export const selectIsLoading = createSelector([selectUIState], ui => ui.isLoading)

export const selectLoadingMessage = createSelector([selectUIState], ui => ui.loadingMessage)

export const selectLoadingState = createSelector(
  [selectIsLoading, selectLoadingMessage],
  (isLoading, message) => ({ isLoading, message })
)

// Modal selectors
export const selectModals = createSelector([selectUIState], ui => ui.modals)

export const selectIsModalOpen = (modalName: string) =>
  createSelector([selectModals], modals => modals[modalName] || false)

export const selectAnyModalOpen = createSelector([selectModals], modals =>
  Object.values(modals).some(Boolean)
)

// Notification selectors
export const selectNotifications = createSelector([selectUIState], ui => ui.notifications)

export const selectNotificationCount = createSelector(
  [selectNotifications],
  notifications => notifications.length
)

export const selectLatestNotification = createSelector(
  [selectNotifications],
  notifications => notifications[notifications.length - 1] || null
)

export const selectNotificationsByType = (type: 'success' | 'error' | 'warning' | 'info') =>
  createSelector([selectNotifications], notifications =>
    notifications.filter((n: NotificationState) => n.type === type)
  )

export const selectHasUnreadNotifications = createSelector(
  [selectNotifications],
  notifications => notifications.length > 0
)

// Connection status selectors
export const selectConnectionStatus = createSelector([selectUIState], ui => ui.connectionStatus)

export const selectIsConnected = createSelector(
  [selectConnectionStatus],
  status => status === 'connected'
)

export const selectIsConnecting = createSelector(
  [selectConnectionStatus],
  status => status === 'connecting'
)

export const selectConnectionError = createSelector(
  [selectConnectionStatus],
  status => status === 'error'
)

// Combined UI state selectors
export const selectUIStatus = createSelector(
  [selectTheme, selectSidebarOpen, selectIsLoading, selectConnectionStatus],
  (theme, sidebarOpen, isLoading, connectionStatus) => ({
    theme,
    sidebarOpen,
    isLoading,
    connectionStatus,
  })
)

export const selectAppReadyState = createSelector(
  [selectIsLoading, selectConnectionStatus],
  (isLoading, connectionStatus) => ({
    isReady: !isLoading && connectionStatus !== 'connecting',
    isLoading,
    connectionStatus,
  })
)
