/**
 * @fileoverview Logo component for application branding
 * Provides consistent branding across the application
 */



export interface LogoProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show text alongside logo */
  showText?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether logo should be clickable */
  onClick?: () => void;
}

/**
 * Logo component displays the snstr-client branding
 * Includes the matrix green accent and cypherpunk aesthetic
 */
export function Logo({ 
  size = 'md', 
  showText = true, 
  className = '',
  onClick 
}: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`flex items-center gap-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Logo Icon */}
      <div 
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center transition-all duration-200`}
        style={{ 
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)'
        }}
      >
        <svg 
          width="70%" 
          height="70%" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
          className="text-black"
        >
          {/* Stylized "S" for SNSTR */}
          <path d="M17 6c-1.5-2-8-2-8 2 0 3 7 1 7 5 0 3-7 3-7 0" />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span 
            className={`${textSizeClasses[size]} font-bold leading-none`}
            style={{ color: 'var(--text-primary)' }}
          >
            snstr
            <span style={{ color: 'var(--accent-primary)' }}>-client</span>
          </span>
          {size !== 'sm' && (
            <span 
              className="text-xs font-mono leading-none mt-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              decentralized
            </span>
          )}
        </div>
      )}
    </Component>
  );
}

export default Logo; 