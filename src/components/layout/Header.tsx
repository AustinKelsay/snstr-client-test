/**
 * Header component with app branding and navigation
 * Responsive design with mobile menu support
 */

import { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'
import Button from '@/components/ui/Button'
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
    <div className={cn('border-b border-border bg-background/80 backdrop-blur-sm', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-bold text-foreground">
                <span className="text-primary">snstr</span>
                <span className="text-muted-foreground">-client</span>
              </h1>
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/timeline" className="text-foreground hover:text-primary transition-colors">
              Timeline
            </Link>
            <Link to="/profile" className="text-foreground hover:text-primary transition-colors">
              Profile
            </Link>
            <Link to="/messages" className="text-foreground hover:text-primary transition-colors">
              Messages
            </Link>
            <Link to="/settings" className="text-foreground hover:text-primary transition-colors">
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
                    ? 'w-3 h-3 rounded-full bg-green-500 animate-pulse'
                    : 'w-3 h-3 rounded-full bg-muted'
                }
              />
              <span className="text-sm text-muted-foreground">
                {extensionStatus.available
                  ? extensionStatus.hasBasicSupport
                    ? 'Extension Ready'
                    : 'Extension Detected (Limited)'
                  : 'Extension Not Detected'}
              </span>
            </div>
            <Button variant="outline" size="sm">
              Connect Wallet
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile navigation menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col gap-4">
              <a
                href="#timeline"
                className="text-foreground hover:text-primary transition-colors py-2"
              >
                Timeline
              </a>
              <a
                href="#profile"
                className="text-foreground hover:text-primary transition-colors py-2"
              >
                Profile
              </a>
              <a
                href="#messages"
                className="text-foreground hover:text-primary transition-colors py-2"
              >
                Messages
              </a>
              <a
                href="#settings"
                className="text-foreground hover:text-primary transition-colors py-2"
              >
                Settings
              </a>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-muted animate-pulse" />
                  <span className="text-sm text-muted-foreground">Extension Detection</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Connect Wallet
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}

export default Header
