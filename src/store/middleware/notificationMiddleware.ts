/**
 * Notification middleware for Redux store
 * Handles automatic removal of notifications after their specified duration
 * This middleware listens for addNotification actions and sets up timeouts
 * to dispatch removeNotification actions, keeping side effects out of reducers
 */

import { type Middleware } from '@reduxjs/toolkit'
import { addNotification, removeNotification } from '@/store/slices/uiSlice'

// Store timeout references to allow cleanup if needed
const notificationTimeouts = new Map<string, NodeJS.Timeout>()

/**
 * Middleware that handles automatic notification removal
 * Listens for addNotification actions and sets up setTimeout
 * to dispatch removeNotification after the specified duration
 */
export const notificationMiddleware: Middleware =
  store => next => action => {
    // Call the next middleware/reducer first
    const result = next(action)

    // Check if this is an addNotification action
    if (addNotification.match(action)) {
      const notification = action.payload
      const duration = notification.duration || 5000

      // Only set timeout if duration is positive
      if (duration > 0) {
        // Get the notification ID from the state (it's generated in the reducer)
        const state = store.getState()
        const addedNotification = state.ui.notifications[state.ui.notifications.length - 1]
        
        if (addedNotification) {
          const notificationId = addedNotification.id

          // Clear any existing timeout for this notification
          const existingTimeout = notificationTimeouts.get(notificationId)
          if (existingTimeout) {
            clearTimeout(existingTimeout)
          }

          // Set up new timeout
          const timeoutId = setTimeout(() => {
            store.dispatch(removeNotification(notificationId))
            notificationTimeouts.delete(notificationId)
          }, duration)

          // Store timeout reference
          notificationTimeouts.set(notificationId, timeoutId)
        }
      }
    }

    // Check if this is a removeNotification action to cleanup timeout
    if (removeNotification.match(action)) {
      const notificationId = action.payload
      const timeoutId = notificationTimeouts.get(notificationId)
      
      if (timeoutId) {
        clearTimeout(timeoutId)
        notificationTimeouts.delete(notificationId)
      }
    }

    return result
  }

/**
 * Cleanup function to clear all notification timeouts
 * Useful for app teardown or testing
 */
export function clearAllNotificationTimeouts(): void {
  notificationTimeouts.forEach(timeoutId => clearTimeout(timeoutId))
  notificationTimeouts.clear()
} 