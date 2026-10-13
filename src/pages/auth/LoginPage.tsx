import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Pill, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/customer';
  const { login } = useAuth();
  const { showToast } = useToast();

  // Form inputs
  const [identifier, setIdentifier] = useState(''); // email or mobile
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form states
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; general?: string }>({});

  const validate = (): boolean => {
    const newErrors: { identifier?: string; password?: string } = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Please enter your registered email address or mobile number.';
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
      const isPhone = /^[0-9+\s-]{10,15}$/.test(identifier.trim());
      if (!isEmail && !isPhone) {
        newErrors.identifier = 'Please enter a valid email address (e.g. name@example.com) or 10-digit mobile number.';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
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
      // Simulate frontend-only authentication delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      await login(identifier.trim(), password, 'CUSTOMER');
      setIsSuccess(true);
      showToast('Login Successful', 'Welcome back to Med Bazar!', 'success');

      if (rememberMe) {
        localStorage.setItem('medbazar_remember', identifier.trim());
      } else {
        localStorage.removeItem('medbazar_remember');
      }

      setTimeout(() => {
        navigate(redirect);
      }, 700);
    } catch {
      setErrors({ general: 'Authentication failed. Please check your credentials and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for testing
  const handleQuickFill = (type: 'email' | 'phone') => {
    if (type === 'email') {
      setIdentifier('rajesh.sharma@example.com');
    } else {
      setIdentifier('+91 98765 43210');
    }
    setPassword('Customer@123');
    setErrors({});
  };

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
          Sign In to Your Account
        </h1>
        <p className="mt-1 text-xs text-gray-600">
          Access your prescriptions, doorstep orders, and branch pharmacy history
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-sand-300 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
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

          {/* Success Banner */}
          {isSuccess && (
            <div
              role="status"
              className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Login verified! Redirecting to customer marketplace...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email / Mobile Field */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="login-identifier"
                className="block text-xs font-semibold text-gray-700 tracking-wider select-none"
              >
                Email Address or Mobile Number <span className="text-red-500" aria-hidden="true">*</span>
              </label>

              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  {identifier.includes('@') ? (
                    <Mail className="w-4 h-4" />
                  ) : (
                    <Phone className="w-4 h-4" />
                  )}
                </div>

                <input
                  id="login-identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  disabled={isLoading || isSuccess}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: undefined }));
                  }}
                  placeholder="e.g. rajesh@example.com or 9876543210"
                  aria-invalid={Boolean(errors.identifier)}
                  aria-describedby={errors.identifier ? 'identifier-error' : undefined}
                  className={`block w-full rounded-xl border text-xs font-sans pl-10 pr-3.5 py-2.5 transition-all duration-150 ${
                    errors.identifier
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-red-950 bg-red-50/20'
                      : 'border-sand-300 hover:border-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white text-gray-900'
                  } disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`}
                />
              </div>

              {errors.identifier && (
                <p id="identifier-error" role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.identifier}</span>
                </p>
              )}
            </div>

            {/* Password Field with Show/Hide */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-gray-700 tracking-wider select-none"
                >
                  Password <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-brand-700 hover:text-brand-800 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>

                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isLoading || isSuccess}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
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

              {errors.password && (
                <p id="password-error" role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Remember Session UI */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  disabled={isLoading || isSuccess}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-sand-300 text-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-0 transition-colors"
                />
                <span className="text-xs text-gray-600 font-medium">Remember me on this device</span>
              </label>
            </div>

            {/* Login CTA */}
            <Button
              type="submit"
              disabled={isLoading || isSuccess}
              isLoading={isLoading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl shadow-2xs transition-all duration-150 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
            >
              {isSuccess ? 'Verified' : 'Sign In to Med Bazar'}
            </Button>
          </form>

          {/* Quick Demo Pre-fill helper (Frontend testing) */}
          <div className="pt-2 border-t border-sand-200">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block mb-2 text-center">
              Quick Test Autofill
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('email')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-sand-100 hover:bg-sand-200 border border-sand-300 text-[11px] font-medium text-gray-700 transition-colors"
              >
                Use Email Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('phone')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-sand-100 hover:bg-sand-200 border border-sand-300 text-[11px] font-medium text-gray-700 transition-colors"
              >
                Use Phone Demo
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center pt-2 border-t border-sand-200 text-xs text-gray-600">
            Don't have a Med Bazar account?{' '}
            <Link
              to="/register"
              className="font-bold text-brand-700 hover:text-brand-800 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1"
            >
              Create an account
            </Link>
          </div>
        </div>

        {/* Security / HIPAA compliance note */}
        <div className="mt-6 text-center flex items-center justify-center gap-1.5 text-xs text-gray-500 font-sans">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Pharmacy Marketplace & Secure Healthcare Session</span>
        </div>
      </div>
    </div>
  );
};
