/**
 * @fileoverview Modal component for overlay dialogs
 * Provides accessible modal dialogs with proper focus management
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether clicking backdrop closes modal */
  closeOnBackdropClick?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Modal component provides accessible overlay dialogs
 * Includes proper focus management, backdrop handling, and keyboard navigation
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  showCloseButton = true,
  closeOnBackdropClick = true,
  size = 'md'
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`
          card w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto
          ${className}
        `}
        style={{ 
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-accent)',
          boxShadow: 'var(--shadow-xl)'
        }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-primary)]">
            {title && (
              <h2 
                id="modal-title"
                className="text-xl font-semibold text-[var(--text-primary)]"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Close modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Modal; 