/**
 * @fileoverview StatusIndicator component for displaying connection states
 * Provides visual feedback for various status conditions
 */


import LoadingSpinner from '@/components/ui/LoadingSpinner';

export interface StatusIndicatorProps {
  /** Status type */
  status: 'connected' | 'connecting' | 'disconnected' | 'error' | 'loading';
  /** Status label */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show pulse animation */
  animated?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * StatusIndicator component displays connection and status states
 * Provides consistent visual feedback across the application
 */
export function StatusIndicator({ 
  status, 
  label, 
  size = 'md', 
  animated = true,
  className = '' 
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'var(--success)',
          bgColor: 'rgba(0, 255, 0, 0.2)',
          text: label || 'Connected',
          icon: null
        };
      case 'connecting':
        return {
          color: 'var(--warning)',
          bgColor: 'rgba(255, 170, 0, 0.2)',
          text: label || 'Connecting...',
          icon: <LoadingSpinner size="sm" />
        };
      case 'disconnected':
        return {
          color: 'var(--text-tertiary)',
          bgColor: 'rgba(102, 102, 102, 0.2)',
          text: label || 'Disconnected',
          icon: null
        };
      case 'error':
        return {
          color: 'var(--error)',
          bgColor: 'rgba(255, 51, 102, 0.2)',
          text: label || 'Error',
          icon: null
        };
      case 'loading':
        return {
          color: 'var(--accent-primary)',
          bgColor: 'rgba(0, 255, 65, 0.2)',
          text: label || 'Loading...',
          icon: <LoadingSpinner size="sm" />
        };
      default:
        return {
          color: 'var(--text-tertiary)',
          bgColor: 'rgba(102, 102, 102, 0.2)',
          text: label || 'Unknown',
          icon: null
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status Indicator */}
      <div className="relative flex items-center">
        {config.icon ? (
          config.icon
        ) : (
          <div
            className={`${sizeClasses[size]} rounded-full transition-all duration-200 ${
              animated && status === 'connected' ? 'animate-pulse' : ''
            }`}
            style={{ 
              backgroundColor: config.color,
              boxShadow: animated ? `0 0 8px ${config.color}` : 'none'
            }}
          />
        )}
        
        {/* Outer ring for emphasis */}
        {status === 'connected' && animated && (
          <div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full animate-ping`}
            style={{ backgroundColor: config.color, opacity: 0.3 }}
          />
        )}
      </div>

      {/* Status Text */}
      {config.text && (
        <span 
          className={`${textSizeClasses[size]} font-medium transition-colors`}
          style={{ color: config.color }}
        >
          {config.text}
        </span>
      )}
    </div>
  );
}

export default StatusIndicator; 