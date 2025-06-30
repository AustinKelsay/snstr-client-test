/**
 * @fileoverview Textarea component for multi-line text inputs
 * Provides styled textarea fields with validation states
 */

import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'ghost';
  /** Whether to show character count */
  showCharCount?: boolean;
  /** Maximum character limit */
  maxLength?: number;
  /** Whether textarea should auto-resize */
  autoResize?: boolean;
}

/**
 * Textarea component provides styled multi-line text inputs
 * Supports validation states, character counting, and auto-resize
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  showCharCount = false,
  maxLength,
  autoResize = false,
  className = '',
  id,
  value,
  onChange,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const currentLength = typeof value === 'string' ? value.length : 0;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[80px]',
    md: 'px-4 py-3 text-base min-h-[100px]',
    lg: 'px-5 py-4 text-lg min-h-[120px]'
  };

  const getTextareaClasses = () => {
    const baseClasses = `
      w-full rounded-lg border transition-all duration-200
      bg-[var(--bg-tertiary)] text-[var(--text-primary)]
      placeholder:text-[var(--text-tertiary)]
      focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-opacity-50
      disabled:opacity-50 disabled:cursor-not-allowed
      resize-vertical
      ${sizeClasses[size]}
      ${autoResize ? 'resize-none overflow-hidden' : ''}
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
    onChange?.(e);
  };

  // Auto-resize effect
  React.useEffect(() => {
    if (autoResize && ref && typeof ref !== 'function' && ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value, autoResize, ref]);

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-[var(--text-primary)] mb-2"
        >
          {label}
        </label>
      )}

      {/* Textarea Field */}
      <textarea
        ref={ref}
        id={textareaId}
        className={getTextareaClasses()}
        maxLength={maxLength}
        value={value}
        onChange={handleChange}
        {...props}
      />

      {/* Footer with helper text and character count */}
      <div className="flex items-center justify-between mt-2">
        {/* Helper Text / Error */}
        <div className="flex-1">
          {(error || helperText) && (
            <p className={`text-sm ${error ? 'text-[var(--error)]' : 'text-[var(--text-secondary)]'}`}>
              {error || helperText}
            </p>
          )}
        </div>

        {/* Character Count */}
        {showCharCount && (
          <div className={`text-sm ${
            maxLength && currentLength > maxLength * 0.9
              ? 'text-[var(--warning)]'
              : 'text-[var(--text-tertiary)]'
          }`}>
            {currentLength}{maxLength && `/${maxLength}`}
          </div>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea; 