import React, { InputHTMLAttributes, forwardRef } from 'react';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: boolean | string;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      success,
      isLoading,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperId = inputId ? `${inputId}-helper` : undefined;

    const hasSuccess = Boolean(success);
    const successMessage = typeof success === 'string' ? success : undefined;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-gray-700 tracking-wider select-none"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative rounded-lg shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled || isLoading}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={twMerge(
              clsx(
                'block w-full rounded-lg border text-sm font-sans transition-all duration-150',
                'bg-white text-gray-900 placeholder:text-gray-400',
                'hover:border-sand-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
                'disabled:bg-sand-100 disabled:text-gray-400 disabled:border-sand-200 disabled:cursor-not-allowed',
                leftIcon ? 'pl-9' : 'pl-3.5',
                (rightIcon || isLoading || error || hasSuccess) ? 'pr-9' : 'pr-3.5',
                'py-2',
                error
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100 text-red-950'
                  : hasSuccess
                  ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-100 text-emerald-950'
                  : 'border-sand-300 focus:border-brand-500 focus:ring-brand-100',
                className
              )
            )}
            {...props}
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            ) : error ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : hasSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : rightIcon ? (
              <div className="pointer-events-auto">{rightIcon}</div>
            ) : null}
          </div>
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
            <span>{error}</span>
          </p>
        )}

        {!error && successMessage && (
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <span>{successMessage}</span>
          </p>
        )}

        {!error && !successMessage && helperText && (
          <p id={helperId} className="text-xs text-gray-500 mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
