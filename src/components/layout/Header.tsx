/**
 * Header component with app branding and navigation
 * Responsive design with mobile menu support
 * Uses cypherpunk matrix green theme system
 */

import { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAppSelector } from '@/store'
import { selectExtensionStatus } from '@/store/selectors/authSelectors'
import { Link } from 'react-router-dom'

interface HeaderProps {
  className?: string
}

function Header({ className }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Get extension status from Redux
  const extensionStatus = useAppSelector(selectExtensionStatus)

  return (
    <div 
      className={cn('border-b backdrop-blur-sm', className)}
      style={{ 
        borderColor: 'var(--border-primary)',
        backgroundColor: 'var(--surface-primary)',
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Connection status indicator */}
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
                {extensionStatus.available
                  ? extensionStatus.hasBasicSupport
                    ? 'Extension Ready'
                    : 'Extension Detected (Limited)'
                  : 'Extension Not Detected'}
              </span>
            </div>
            <button className="btn-base btn-secondary btn-sm">
              Connect Wallet
            </button>
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
              >
                Timeline
              </Link>
              <Link
                to="/profile"
                className="py-2 transition-colors hover:text-glow"
                style={{ color: 'var(--text-primary)' }}
              >
                Profile
              </Link>
              <Link
                to="/messages"
                className="py-2 transition-colors hover:text-glow"
                style={{ color: 'var(--text-primary)' }}
              >
                Messages
              </Link>
              <Link
                to="/settings"
                className="py-2 transition-colors hover:text-glow"
                style={{ color: 'var(--text-primary)' }}
              >
                Settings
              </Link>
              <div 
                className="pt-4 border-t"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--text-tertiary)' }}
                  />
                  <span 
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Extension Detection
                  </span>
                </div>
                <button className="btn-base btn-secondary btn-sm w-full">
                  Connect Wallet
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}

export default Header
