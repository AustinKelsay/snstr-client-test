/**
 * @fileoverview EmptyState component for empty data scenarios
 * Provides consistent messaging when no data is available
 */

import React from 'react';

export interface EmptyStateProps {
  /** Icon to display (emoji or component) */
  icon?: React.ReactNode;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * EmptyState component displays helpful messaging when no data is available
 * Encourages user action with clear calls-to-action
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  size = 'md'
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'text-4xl mb-3',
      title: 'text-lg',
      description: 'text-sm',
      spacing: 'mb-4'
    },
    md: {
      container: 'py-12',
      icon: 'text-6xl mb-4',
      title: 'text-xl',
      description: 'text-base',
      spacing: 'mb-6'
    },
    lg: {
      container: 'py-16',
      icon: 'text-8xl mb-6',
      title: 'text-2xl',
      description: 'text-lg',
      spacing: 'mb-8'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`text-center ${classes.container} ${className}`}>
      {/* Icon */}
      {icon && (
        <div className={`${classes.icon} text-[var(--text-tertiary)]`}>
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className={`${classes.title} font-semibold text-[var(--text-primary)] mb-2`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={`${classes.description} text-[var(--text-secondary)] ${classes.spacing} max-w-md mx-auto`}>
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className={`btn-base ${
            action.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState; 