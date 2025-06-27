/**
 * Page layout component that provides consistent structure across the application
 * Includes responsive design and proper spacing for mobile and desktop
 */

import { cn } from '@/utils/cn'
import type { BaseComponentProps } from '@/types'

interface PageLayoutProps extends BaseComponentProps {
  header?: React.ReactNode
  sidebar?: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: boolean
}

function PageLayout({
  children,
  header,
  sidebar,
  footer,
  maxWidth = 'lg',
  padding = true,
  className,
}: PageLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full',
  }

  return (
    <div className={cn('min-h-screen bg-background flex flex-col', className)}>
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
          {header}
        </header>
      )}

      {/* Main content area */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        {sidebar && (
          <aside className="hidden lg:block w-64 border-r border-border bg-card">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">{sidebar}</div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden">
          <div
            className={cn(
              'mx-auto w-full',
              maxWidthClasses[maxWidth],
              padding && 'px-4 sm:px-6 lg:px-8 py-6'
            )}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {footer && <footer className="border-t border-border bg-card mt-auto">{footer}</footer>}
    </div>
  )
}

export default PageLayout
