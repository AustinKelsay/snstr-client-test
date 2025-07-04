/**
 * @fileoverview Input component for form inputs
 * Provides styled input fields with validation states
 */

import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'ghost' | 'technical';
  /** Whether input is in loading state */
  loading?: boolean;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
}

/**
 * Input component provides styled form inputs
 * Supports validation states, icons, and proper accessibility
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: 'h-input-sm px-3 text-sm',
    md: 'h-input-md px-4 text-base',
    lg: 'h-input-lg px-5 text-lg'
  };

  const getInputClasses = () => {
    const baseClasses = `
      w-full rounded-sm border transition-all duration-200 ease-in-out
      bg-bg-tertiary text-text-primary font-sans
      placeholder:text-text-tertiary placeholder:font-mono placeholder:text-xs
      focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-30
      focus:border-accent-primary focus:bg-bg-secondary
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-quaternary
      ${leftIcon ? 'pl-10' : ''}
      ${rightIcon || loading ? 'pr-10' : ''}
    `;

    if (error) {
      return cn(
        baseClasses,
        sizeClasses[size],
        'border-error focus:border-error focus:ring-error shadow-glow-red/20',
        className
      );
    }

    if (variant === 'ghost') {
      return cn(
        baseClasses,
        sizeClasses[size],
        'border-transparent bg-transparent hover:bg-bg-hover focus:bg-bg-tertiary focus:border-border-secondary',
        className
      );
    }

    if (variant === 'technical') {
      return cn(
        baseClasses,
        sizeClasses[size],
        'border-border-primary hover:border-accent-primary bg-bg-primary font-mono text-xs tracking-wide',
        'focus:shadow-glow-green/20 focus:bg-bg-secondary',
        className
      );
    }

    return cn(
      baseClasses,
      sizeClasses[size],
      'border-border-primary hover:border-border-secondary hover:bg-bg-secondary',
      'focus:shadow-glow-green/10',
      className
    );
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary mb-2 font-mono tracking-wide"
        >
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary pointer-events-none">
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          className={getInputClasses()}
          disabled={disabled || loading}
          {...props}
        />

        {/* Right Icon / Loading */}
        {(rightIcon || loading) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary pointer-events-none">
            {loading ? (
              <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              rightIcon
            )}
          </div>
        )}
      </div>

      {/* Helper Text / Error */}
      {(error || helperText) && (
        <div className="mt-2 flex items-start gap-1">
          {error && (
            <span className="text-error text-xs">▲</span>
          )}
          <p className={cn(
            'text-xs font-mono tracking-wide',
            error ? 'text-error' : 'text-text-secondary'
          )}>
          {error || helperText}
        </p>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 