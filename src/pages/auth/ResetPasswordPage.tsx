import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pill, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = 'New password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please re-enter your new password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate frontend-only password reset request
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsSuccess(true);
      showToast('Password Updated', 'Your Med Bazar password has been reset successfully.', 'success');
    } catch {
      setErrors({ general: 'Failed to reset password. The reset link may have expired.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);

  return (
    <div className="min-h-screen bg-sand-50 text-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Header */}
        <Link
          to="/customer"
          className="inline-flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-2xl p-1"
          aria-label="Med Bazar Home"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-2xs group-hover:bg-brand-700 transition-colors">
            <Pill className="w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Med<span className="text-brand-600">Bazar</span>
          </span>
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900">
          Set New Password
        </h1>
        <p className="mt-1 text-xs text-gray-600">
          Create a strong password for your verified customer account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-sand-300 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          {isSuccess ? (
            /* Success State Card */
            <div className="text-center space-y-5 py-2 animate-fadeIn" role="status">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg font-extrabold text-gray-900">Password Reset Completed</h2>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Your password has been changed securely. You can now use your new password to access Med Bazar.
                </p>
              </div>

              <div className="pt-2">
                <Link to="/login">
                  <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl shadow-2xs">
                    Sign In with New Password
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Default / Form State */
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* General Error Banner */}
              {errors.general && (
                <div
                  role="alert"
                  className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errors.general}</span>
                </div>
              )}

              {/* New Password Field */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="reset-password"
                  className="block text-xs font-semibold text-gray-700 tracking-wider select-none"
                >
                  New Password <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="At least 8 characters"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    className={`block w-full rounded-xl border text-xs font-sans pl-10 pr-10 py-2.5 transition-all duration-150 ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-red-950 bg-red-50/20'
                        : 'border-sand-300 hover:border-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white text-gray-900'
                    } disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-brand-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Requirement Indicators */}
                {password.length > 0 && (
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-500 font-mono">
                    <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
                      ✓ 8+ chars
                    </span>
                    <span className={`flex items-center gap-1 ${hasLetter ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
                      ✓ Letters
                    </span>
                    <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
                      ✓ Numbers
                    </span>
                  </div>
                )}

                {errors.password && (
                  <p id="password-error" role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Confirm New Password Field */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="reset-confirm-password"
                  className="block text-xs font-semibold text-gray-700 tracking-wider select-none"
                >
                  Confirm New Password <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }}
                    placeholder="Re-enter your new password"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                    className={`block w-full rounded-xl border text-xs font-sans pl-10 pr-10 py-2.5 transition-all duration-150 ${
                      errors.confirmPassword
                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-red-950 bg-red-50/20'
                        : 'border-sand-300 hover:border-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white text-gray-900'
                    } disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-brand-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirm-password-error" role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl shadow-2xs transition-all duration-150 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 mt-2"
                rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
              >
                Reset Password
              </Button>

              <div className="text-center pt-2 border-t border-sand-200">
                <Link
                  to="/login"
                  className="text-xs text-gray-600 hover:text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center flex items-center justify-center gap-1.5 text-xs text-gray-500 font-sans">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Multi-Tenant Password Security Standards</span>
        </div>
      </div>
    </div>
  );
};
