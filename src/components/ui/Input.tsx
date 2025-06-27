/**
 * @fileoverview Input component for form inputs
 * Provides styled input fields with validation states
 */

import React, { forwardRef } from 'react';

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
  variant?: 'default' | 'ghost';
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
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const getInputClasses = () => {
    const baseClasses = `
      w-full rounded-lg border transition-all duration-200
      bg-[var(--bg-tertiary)] text-[var(--text-primary)]
      placeholder:text-[var(--text-tertiary)]
      focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-opacity-50
      disabled:opacity-50 disabled:cursor-not-allowed
      ${sizeClasses[size]}
      ${leftIcon ? 'pl-10' : ''}
      ${rightIcon || loading ? 'pr-10' : ''}
      ${className}
    `;

    if (error) {
      return `${baseClasses} border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]`;
    }

    if (variant === 'ghost') {
      return `${baseClasses} border-transparent bg-transparent hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-tertiary)]`;
    }

    return `${baseClasses} border-[var(--border-primary)] hover:border-[var(--border-secondary)] focus:border-[var(--accent-primary)]`;
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--text-primary)] mb-2"
        >
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)]">
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
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)]">
            {loading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
            ) : (
              rightIcon
            )}
          </div>
        )}
      </div>

      {/* Helper Text / Error */}
      {(error || helperText) && (
        <p className={`mt-2 text-sm ${error ? 'text-[var(--error)]' : 'text-[var(--text-secondary)]'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 