/**
 * @fileoverview MobileNavigation component for mobile bottom tabs
 * Provides touch-friendly navigation for mobile devices
 */


import { useLocation, Link } from 'react-router-dom';

export interface MobileNavigationProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * MobileNavigation component provides bottom tab navigation for mobile
 * Optimized for touch interactions with large tap targets
 */
export function MobileNavigation({ className = '' }: MobileNavigationProps) {
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Timeline',
      path: '/timeline',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
        </svg>
      )
    },
    {
      label: 'Search',
      path: '/search',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      )
    },
    {
      label: 'Compose',
      path: '/compose',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14m7-7H5"/>
        </svg>
      ),
      special: true
    },
    {
      label: 'Messages',
      path: '/messages',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    {
      label: 'Profile',
      path: '/profile',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    }
  ];

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)]
      safe-area-inset-bottom z-30
      ${className}
    `}>
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200
                min-w-[60px] min-h-[60px]
                ${item.special 
                  ? 'bg-[var(--accent-primary)] text-[var(--text-inverse)] hover:bg-[var(--accent-secondary)]'
                  : isActive 
                    ? 'text-[var(--accent-primary)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              <span className="flex-shrink-0 mb-1">{item.icon}</span>
              <span className="text-xs font-medium leading-none">{item.label}</span>
              
              {/* Active Indicator */}
              {isActive && !item.special && (
                <div 
                  className="w-1 h-1 rounded-full mt-1"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default MobileNavigation; 