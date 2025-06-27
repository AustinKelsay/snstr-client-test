/**
 * @fileoverview Authentication client for NIP-07 browser extension integration
 * Handles complete authentication flow including login, logout, and profile management
 * Integrates with Redux store for state management
 */

import { store } from '@/store'
import { 
  setLoading, 
  setError, 
  setUser, 
  setPublicKey, 
  setExtension, 
  logout as logoutAction 
} from '@/store/slices/authSlice'
import {
  detectNostrExtension,
  getPublicKey,
  signEvent as signEventExtension,
  getRelays,
  waitForExtension,
} from '@/utils/nip07'
import type { 
  UserProfile, 
  UnsignedEvent, 
  SignedEvent, 
  ExtensionDetection 
} from '@/types/auth'
import type { PublicKey } from '@/types'

/**
 * Main authentication client class
 * Handles all authentication operations and state management
 */
export class AuthClient {
  private static instance: AuthClient | null = null
  private profileCache: Map<PublicKey, UserProfile> = new Map()

  private constructor() {}

  /**
   * Get singleton instance of AuthClient
   * @returns AuthClient instance
   */
  static getInstance(): AuthClient {
    if (!AuthClient.instance) {
      AuthClient.instance = new AuthClient()
    }
    return AuthClient.instance
  }

  /**
   * Initialize authentication system
   * Detects extension and attempts auto-login if previously authenticated
   */
  async initialize(): Promise<void> {
    store.dispatch(setLoading(true))

    try {
      // Wait for extension to load (extensions may load after page)
      const extensionReady = await waitForExtension(5000)
      
      if (!extensionReady) {
        store.dispatch(setError('No compatible Nostr extension found. Please install Alby, nos2x, or another NIP-07 compatible extension.'))
        return
      }

      // Detect extension capabilities
      const detection = await this.detectExtension()
      
      if (!detection.isAvailable) {
        store.dispatch(setError('Nostr extension detected but not functional'))
        return
      }

      // Try to get public key (will prompt user if needed)
      const pubkey = await this.getPublicKey()
      
      if (pubkey) {
        // Successfully got public key, user is authenticated
        await this.completeLogin(pubkey)
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      store.dispatch(setError(error instanceof Error ? error.message : 'Authentication initialization failed'))
    } finally {
      store.dispatch(setLoading(false))
    }
  }

  /**
   * Detect and test extension capabilities
   * @returns Promise<ExtensionDetection>
   */
  async detectExtension(): Promise<ExtensionDetection> {
    try {
      const detection = await detectNostrExtension()
      
      store.dispatch(setExtension({
        available: detection.isAvailable,
        capabilities: detection.capabilities
      }))

      return detection
    } catch (error) {
      console.error('Extension detection error:', error)
      throw new Error('Failed to detect extension capabilities')
    }
  }

  /**
   * Attempt to get public key from extension
   * @returns Promise<PublicKey | null>
   */
  async getPublicKey(): Promise<PublicKey | null> {
    try {
      const pubkey = await getPublicKey()
      
      if (pubkey) {
        store.dispatch(setPublicKey(pubkey))
      }

      return pubkey
    } catch (error) {
      console.error('Get public key error:', error)
      return null
    }
  }

  /**
   * Complete login process
   * @param pubkey - User's public key
   */
  private async completeLogin(pubkey: PublicKey): Promise<void> {
    try {
      // Fetch user profile
      const profile = await this.fetchUserProfile(pubkey)
      
      // Get relay configuration if supported (TODO: implement relay management)
      await getRelays()
      
      // Create user object
      const user: UserProfile = {
        pubkey,
        ...profile,
      }

      // Update store
      store.dispatch(setUser(user))
      
      console.log('User successfully authenticated:', user.name || user.pubkey)
    } catch (error) {
      console.error('Complete login error:', error)
      throw new Error('Failed to complete login process')
    }
  }

  /**
   * Fetch user profile metadata (NIP-01 kind 0 events)
   * @param pubkey - User's public key
   * @returns Promise<Partial<UserProfile>>
   */
  async fetchUserProfile(pubkey: PublicKey): Promise<Partial<UserProfile>> {
    // Check cache first
    if (this.profileCache.has(pubkey)) {
      return this.profileCache.get(pubkey)!
    }

    try {
      // TODO: Implement actual profile fetching from relays
      // For now, return minimal profile
      const profile: Partial<UserProfile> = {
        pubkey,
        name: `User ${pubkey.slice(0, 8)}...`,
      }

      // Cache the profile
      this.profileCache.set(pubkey, profile as UserProfile)

      return profile
    } catch (error) {
      console.error('Fetch profile error:', error)
      return { pubkey }
    }
  }

  /**
   * Sign an event using the extension
   * @param event - Unsigned event to sign
   * @returns Promise<SignedEvent>
   */
  async signEvent(event: UnsignedEvent): Promise<SignedEvent> {
    try {
      const signedEvent = await signEventExtension(event)
      
      if (!signedEvent) {
        throw new Error('Failed to sign event')
      }

      return signedEvent
    } catch (error) {
      console.error('Sign event error:', error)
      throw new Error('Failed to sign event: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  /**
   * Login user by requesting public key from extension
   */
  async login(): Promise<void> {
    store.dispatch(setLoading(true))
    store.dispatch(setError(null))

    try {
      // First check if extension is available
      const detection = await this.detectExtension()
      
      if (!detection.isAvailable) {
        throw new Error('No compatible Nostr extension found')
      }

      // Request public key (this will prompt the user)
      const pubkey = await this.getPublicKey()
      
      if (!pubkey) {
        throw new Error('Failed to get public key from extension')
      }

      // Complete login process
      await this.completeLogin(pubkey)
    } catch (error) {
      console.error('Login error:', error)
      store.dispatch(setError(error instanceof Error ? error.message : 'Login failed'))
      throw error
    } finally {
      store.dispatch(setLoading(false))
    }
  }

  /**
   * Logout user and clear all authentication state
   */
  async logout(): Promise<void> {
    try {
      // Clear cache
      this.profileCache.clear()
      
      // Clear Redux state
      store.dispatch(logoutAction())
      
      console.log('User logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear state even if there's an error
      store.dispatch(logoutAction())
    }
  }

  /**
   * Refresh current user's profile
   */
  async refreshProfile(): Promise<void> {
    const state = store.getState()
    const pubkey = state.auth.publicKey
    
    if (!pubkey) {
      throw new Error('No authenticated user to refresh')
    }

    store.dispatch(setLoading(true))

    try {
      // Clear cache and fetch fresh profile
      this.profileCache.delete(pubkey)
      const profile = await this.fetchUserProfile(pubkey)
      
      const updatedUser: UserProfile = {
        ...state.auth.user!,
        ...profile,
      }

      store.dispatch(setUser(updatedUser))
    } catch (error) {
      console.error('Refresh profile error:', error)
      store.dispatch(setError('Failed to refresh profile'))
      throw error
    } finally {
      store.dispatch(setLoading(false))
    }
  }

  /**
   * Check if user is currently authenticated
   * @returns boolean
   */
  isAuthenticated(): boolean {
    const state = store.getState()
    return state.auth.isAuthenticated
  }

  /**
   * Get current user profile
   * @returns UserProfile | null
   */
  getCurrentUser(): UserProfile | null {
    const state = store.getState()
    return state.auth.user
  }

  /**
   * Get current public key
   * @returns PublicKey | null
   */
  getCurrentPublicKey(): PublicKey | null {
    const state = store.getState()
    return state.auth.publicKey
  }
}

// Export singleton instance
export const authClient = AuthClient.getInstance()

// Export convenience functions
export const loginUser = () => authClient.login()
export const logoutUser = () => authClient.logout()
export const refreshUserProfile = () => authClient.refreshProfile()
export const signUserEvent = (event: UnsignedEvent) => authClient.signEvent(event)
export const initializeAuth = () => authClient.initialize() 