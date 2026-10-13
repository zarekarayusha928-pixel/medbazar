import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input, InputProps } from './Input';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showStrengthIndicator?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = 'Password', leftIcon = <Lock className="w-4 h-4 text-gray-400" />, showStrengthIndicator = false, value, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const valStr = typeof value === 'string' ? value : '';
    const hasMinLen = valStr.length >= 8;
    const hasNumber = /\d/.test(valStr);
    const hasUpper = /[A-Z]/.test(valStr);

    return (
      <div className="w-full space-y-1">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          label={label}
          leftIcon={leftIcon}
          value={value}
          rightIcon={
            <button
              type="button"
              onClick={togglePasswordVisibility}
              tabIndex={0}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-brand-600 p-0.5 rounded transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          {...props}
        />

        {showStrengthIndicator && valStr.length > 0 && (
          <div className="pt-1 space-y-1 text-[11px] text-gray-500 font-mono">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${hasMinLen ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              <span className={hasMinLen ? 'text-emerald-700' : 'text-gray-500'}>At least 8 characters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${hasNumber && hasUpper ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              <span className={hasNumber && hasUpper ? 'text-emerald-700' : 'text-gray-500'}>Contains uppercase & number</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
