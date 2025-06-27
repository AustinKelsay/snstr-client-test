/**
 * @fileoverview Select component for dropdown selections
 * Provides styled select dropdowns with proper accessibility
 */

import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Select label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Options array */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Select component provides styled dropdown selections
 * Supports validation states and proper accessibility
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  size = 'md',
  options,
  placeholder,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const getSelectClasses = () => {
    const baseClasses = `
      w-full rounded-lg border transition-all duration-200 appearance-none
      bg-[var(--bg-tertiary)] text-[var(--text-primary)]
      focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-opacity-50
      disabled:opacity-50 disabled:cursor-not-allowed
      cursor-pointer
      ${sizeClasses[size]}
      ${className}
    `;

    if (error) {
      return `${baseClasses} border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]`;
    }

    return `${baseClasses} border-[var(--border-primary)] hover:border-[var(--border-secondary)] focus:border-[var(--accent-primary)]`;
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-[var(--text-primary)] mb-2"
        >
          {label}
        </label>
      )}

      {/* Select Container */}
      <div className="relative">
        {/* Select Field */}
        <select
          ref={ref}
          id={selectId}
          className={getSelectClasses()}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
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

Select.displayName = 'Select';

export default Select; 