/**
 * @fileoverview Textarea component for multi-line text inputs
 * Provides styled textarea fields with validation states
 */

import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

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
  variant?: 'default' | 'ghost' | 'technical';
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
      w-full rounded-sm border transition-all duration-200 ease-in-out
      bg-bg-tertiary text-text-primary font-sans leading-relaxed
      placeholder:text-text-tertiary placeholder:font-mono placeholder:text-xs
      focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-30
      focus:border-accent-primary focus:bg-bg-secondary
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-quaternary
      resize-vertical
      ${autoResize ? 'resize-none overflow-hidden' : ''}
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
        'border-border-primary hover:border-accent-primary bg-bg-primary font-mono text-sm tracking-wide leading-relaxed',
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

  // Character count warning threshold
  const isNearLimit = maxLength && currentLength > maxLength * 0.8;
  const isOverLimit = maxLength && currentLength > maxLength;

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-text-primary mb-2 font-mono tracking-wide"
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
      <div className="flex items-start justify-between mt-2 gap-4">
        {/* Helper Text / Error */}
        <div className="flex-1">
          {(error || helperText) && (
            <div className="flex items-start gap-1">
              {error && (
                <span className="text-error text-xs mt-0.5">▲</span>
              )}
              <p className={cn(
                'text-xs font-mono tracking-wide leading-relaxed',
                error ? 'text-error' : 'text-text-secondary'
              )}>
              {error || helperText}
            </p>
            </div>
          )}
        </div>

        {/* Character Count */}
        {showCharCount && (
          <div className={cn(
            'text-xs font-mono tracking-wide tabular-nums flex-shrink-0',
            isOverLimit ? 'text-error' : 
            isNearLimit ? 'text-warning' : 
            'text-text-tertiary'
          )}>
            <span className={isOverLimit ? 'text-error font-bold' : ''}>
              {currentLength.toLocaleString()}
            </span>
            {maxLength && (
              <>
                <span className="text-text-quaternary mx-1">/</span>
                <span className="text-text-tertiary">
                  {maxLength.toLocaleString()}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea; 