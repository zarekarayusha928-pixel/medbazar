import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Center Container */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div 
          className={twMerge(
            clsx(
              'w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-md transition-all border border-sand-300 z-10',
              sizeClasses[size]
            )
          )}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between border-b border-sand-200 px-4 py-3.5 sm:px-6 sm:py-4 shrink-0">
              <h3 id="modal-title" className="text-sm sm:text-base font-semibold text-gray-900">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal dialog"
                className="rounded-lg p-1 text-gray-400 hover:bg-sand-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="px-4 py-4 sm:px-6 sm:py-5 overflow-y-auto">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 border-t border-sand-200 bg-sand-50/50 px-4 py-3 sm:px-6 sm:py-3.5 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
