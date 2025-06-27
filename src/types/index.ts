/**
 * Global type definitions for the snstr-client-test application
 * Contains common interfaces, types, and utility types used throughout the app
 */

// Base types
export type Timestamp = number
export type HexString = string
export type PublicKey = HexString
export type PrivateKey = HexString
export type EventId = HexString

// Common UI types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Loading and error states
export interface LoadingState {
  isLoading: boolean
  error?: string | null
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  success: boolean
}

// Route constants
export const ROUTES = {
  HOME: '/',
  TIMELINE: '/timeline',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  MESSAGES: '/messages',
} as const

export type Route = (typeof ROUTES)[keyof typeof ROUTES]

// Theme types
export type Theme = 'dark' | 'light'

// Export re-usable utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
