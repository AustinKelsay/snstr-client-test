/**
 * @fileoverview Sidebar component for desktop navigation
 * Provides primary navigation for larger screens
 */


import { useLocation, Link } from 'react-router-dom';
import Logo from '@/components/common/Logo';
import StatusIndicator from '@/components/common/StatusIndicator';

export interface SidebarProps {
  /** Whether sidebar is collapsed */
  collapsed?: boolean;
  /** Callback to toggle sidebar */
  onToggle?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Sidebar component provides desktop navigation
 * Features collapsible state and active route highlighting
 */
export function Sidebar({ collapsed = false, onToggle, className = '' }: SidebarProps) {
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Timeline',
      path: '/timeline',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
        </svg>
      )
    },
    {
      label: 'Profile',
      path: '/profile',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
    {
      label: 'Messages',
      path: '/messages',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    {
      label: 'Search',
      path: '/search',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      )
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
        </svg>
      )
    }
  ];

  return (
    <div className={`
      fixed left-0 top-0 h-full bg-[var(--bg-secondary)] border-r border-[var(--border-primary)]
      transition-all duration-300 z-30
      ${collapsed ? 'w-20' : 'w-64'}
      ${className}
    `}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[var(--border-primary)]">
        <div className="flex items-center justify-between">
          <Logo size="md" showText={!collapsed} />
          
          {/* Toggle Button */}
          <button
            onClick={onToggle}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed ? (
                <path d="M9 18l6-6-6-6"/>
              ) : (
                <path d="M15 18l-6-6 6-6"/>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-[var(--accent-primary)] text-[var(--text-inverse)]' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Status Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border-primary)]">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <StatusIndicator status="connecting" size="sm" />
          {!collapsed && (
            <div className="flex-1">
              <div className="text-xs text-[var(--text-secondary)]">
                Extension Status
              </div>
              <div className="text-xs text-[var(--warning)]">
                Detecting...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar; 