/**
 * Header component with app branding and navigation
 * Responsive design with mobile menu support
 * Uses cypherpunk matrix green theme system
 */

import { useState, useCallback } from 'react'
import { Menu, X, Zap, LogOut, Copy, Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/features/auth'
import { Link } from 'react-router-dom'
import { pubkeyToNpub, formatNip19ForDisplay } from '@/utils/nip19'
import { SkeletonName, SkeletonUsername } from '@/components/common/MicroSkeletons'

interface HeaderProps {
  className?: string
}

function Header({ className }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Get auth state and actions
  const { 
    isAuthenticated,
    user,
    extensionStatus,
    isLoading,
    error,
    login,
    logout,
    canAuthenticate,
    clearError
  } = useAuth()

  // Handle connect extension click
  const handleConnectExtension = async () => {
    try {
      if (error) clearError()
      await login()
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  // Handle logout click
  const handleLogout = () => {
    logout()
  }

  // Copy to clipboard functionality
  const handleCopy = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }, [])

  // Get the best available username for display
  const getDisplayUsername = () => {
    if (!user) return 'User'
    
    // Priority: display_name > name > truncated pubkey
    if (user.display_name && !user.display_name.startsWith('user_')) {
      return user.display_name
    }
    if (user.name && !user.name.startsWith('user_')) {
      return user.name
    }
    // If only auto-generated name available, show truncated pubkey
    return user.pubkey.slice(0, 8) + '...'
  }

  // Get user's npub for display and copying
  const getUserNpub = () => {
    if (!user?.pubkey) return null
    return pubkeyToNpub(user.pubkey)
  }

  // Get formatted npub for display
  const getDisplayNpub = () => {
    const npub = getUserNpub()
    if (!npub) return null
    return formatNip19ForDisplay(npub, { startChars: 8, endChars: 4, showPrefix: false })
  }

  return (
    <div 
      className={cn('border-b backdrop-blur-sm', className)}
      style={{ 
        borderColor: 'var(--border-primary)',
        backgroundColor: 'var(--surface-primary)',
      }}
    >
      <div className="container-padding">
        <div className="flex items-center justify-between h-16">
          {/* Logo and branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap 
                className="w-8 h-8" 
                style={{ color: 'var(--accent-primary)' }}
              />
              <h1 className="text-xl font-bold">
                <span style={{ color: 'var(--accent-primary)' }}>snstr</span>
                <span style={{ color: 'var(--text-secondary)' }}>-client</span>
              </h1>
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/timeline" 
              className="transition-colors hover:text-glow"
              style={{ color: 'var(--text-primary)' }}
            >
              Timeline
            </Link>
            <Link 
              to="/profile" 
              className="transition-colors hover:text-glow"
              style={{ color: 'var(--text-primary)' }}
            >
              Profile
            </Link>
            <Link 
              to="/messages" 
              className="transition-colors hover:text-glow"
              style={{ color: 'var(--text-primary)' }}
            >
              Messages
            </Link>
            <Link 
              to="/settings" 
              className="transition-colors hover:text-glow"
              style={{ color: 'var(--text-primary)' }}
            >
              Settings
            </Link>
          </nav>

          {/* Connection status and auth */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Extension detection indicator - dynamic */}
              <div
                className={
                  extensionStatus.available
                    ? 'w-3 h-3 rounded-full animate-pulse'
                    : 'w-3 h-3 rounded-full'
                }
                style={{
                  backgroundColor: extensionStatus.available 
                    ? 'var(--accent-primary)' 
                    : 'var(--text-tertiary)'
                }}
              />
              <span 
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
{isLoading && isAuthenticated
                  ? (
                      <div className="flex items-center gap-2">
                        <span>Connected: </span>
                        <SkeletonName variant="short" className="inline-block" />
                        <SkeletonUsername className="inline-block" />
                      </div>
                    )
                  : isAuthenticated
                  ? (
                      <div className="flex items-center gap-2">
                        <span>Connected: {getDisplayUsername()}</span>
                        {user && (
                          <button
                            onClick={() => handleCopy(getUserNpub()!, 'npub')}
                            className="group flex items-center gap-1 hover:bg-opacity-20 hover:bg-current px-1 py-0.5 -mx-1 -my-0.5 rounded transition-all duration-200"
                            title={`Copy ${getUserNpub()}`}
                          >
                            <span className="font-mono text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                              {getDisplayNpub()}
                            </span>
                            {copiedField === 'npub' ? (
                              <Check className="w-3 h-3" style={{ color: 'var(--accent-primary)' }} />
                            ) : (
                              <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-all duration-200" />
                            )}
                          </button>
                        )}
                      </div>
                    )
                  : extensionStatus.available
                    ? extensionStatus.hasBasicSupport
                      ? 'Extension Ready'
                      : 'Extension Detected (Limited)'
                    : 'Extension Not Detected'}
              </span>
            </div>
            
            {/* Auth button */}
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="btn-base btn-secondary btn-sm flex items-center gap-2"
                disabled={isLoading}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <button 
                onClick={handleConnectExtension}
                className="btn-base btn-secondary btn-sm"
                disabled={isLoading || !canAuthenticate}
                title={
                  !extensionStatus.available 
                    ? 'Please install a Nostr extension (Alby, nos2x, Flamingo)'
                    : !extensionStatus.hasBasicSupport
                    ? 'Extension does not support required features'
                    : 'Connect your Nostr extension'
                }
              >
                {isLoading ? 'Connecting...' : 'Connect Extension'}
              </button>
            )}
            
            {/* Error display */}
            {error && (
              <div 
                className="text-xs max-w-xs truncate"
                style={{ color: 'var(--error)' }}
                title={error}
              >
                {error}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md transition-colors hover:bg-opacity-10"
            style={{ 
              color: 'var(--text-primary)',
              backgroundColor: mobileMenuOpen ? 'var(--surface-secondary)' : 'transparent'
            }}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile navigation menu */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden border-t py-4"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <nav className="flex flex-col gap-4">
              <Link
                to="/timeline"
                className="py-2 transition-colors hover:text-glow"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Timeline
              </Link>
              <Link
                to="/profile"
                className="py-2 transition-colors hover:text-glow"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/messages"
                className="py-2 transition-colors hover:text-glow"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Messages
              </Link>
              <Link
                to="/settings"
                className="py-2 transition-colors hover:text-glow"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </Link>
              
              {/* Mobile auth section */}
              <div className="pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className={
                      extensionStatus.available
                        ? 'w-3 h-3 rounded-full animate-pulse'
                        : 'w-3 h-3 rounded-full'
                    }
                    style={{
                      backgroundColor: extensionStatus.available 
                        ? 'var(--accent-primary)' 
                        : 'var(--text-tertiary)'
                    }}
                  />
                  <span 
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
{isLoading && isAuthenticated
                      ? (
                          <div className="flex items-center gap-2">
                            <span>Connected: </span>
                            <SkeletonName variant="short" className="inline-block" />
                            <SkeletonUsername className="inline-block" />
                          </div>
                        )
                      : isAuthenticated
                      ? (
                          <div className="flex items-center gap-2">
                            <span>Connected: {getDisplayUsername()}</span>
                            {user && (
                              <button
                                onClick={() => handleCopy(getUserNpub()!, 'npub')}
                                className="group flex items-center gap-1 hover:bg-opacity-20 hover:bg-current px-1 py-0.5 -mx-1 -my-0.5 rounded transition-all duration-200"
                                title={`Copy ${getUserNpub()}`}
                              >
                                <span className="font-mono text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                                  {getDisplayNpub()}
                                </span>
                                {copiedField === 'npub' ? (
                                  <Check className="w-3 h-3" style={{ color: 'var(--accent-primary)' }} />
                                ) : (
                                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-all duration-200" />
                                )}
                              </button>
                            )}
                          </div>
                        )
                      : extensionStatus.available
                        ? extensionStatus.hasBasicSupport
                          ? 'Extension Ready'
                          : 'Extension Detected (Limited)'
                        : 'Extension Not Detected'}
                  </span>
                </div>
                
                {isAuthenticated ? (
                  <button 
                    onClick={handleLogout}
                    className="btn-base btn-secondary btn-sm flex items-center gap-2 w-full justify-center"
                    disabled={isLoading}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                ) : (
                  <button 
                    onClick={handleConnectExtension}
                    className="btn-base btn-secondary btn-sm w-full"
                    disabled={isLoading || !canAuthenticate}
                  >
                    {isLoading ? 'Connecting...' : 'Connect Extension'}
                  </button>
                )}
                
                {error && (
                  <div 
                    className="text-xs mt-2"
                    style={{ color: 'var(--error)' }}
                  >
                    {error}
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}

export default Header
