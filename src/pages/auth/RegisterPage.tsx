import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pill, User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  // Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    general?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Please provide your legal name (at least 2 characters).';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please provide a valid email format (e.g. name@example.com).';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Mobile number is required.';
    } else if (!/^[0-9+\s-]{10,15}$/.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must accept the Terms of Service & Privacy Policy to register.';
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
      const ok = await register(name.trim(), email.trim(), phone.trim(), password, 'CUSTOMER');
      if (!ok) {
        setErrors({ general: 'Registration failed. The email address may already be in use.' });
        return;
      }

      setIsSuccess(true);
      showToast('Registration Complete', 'Your customer account was created successfully!', 'success');

      setTimeout(() => {
        navigate('/customer');
      }, 700);
    } catch {
      setErrors({ general: 'Registration failed. Please check the information provided and try again.' });
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
          className="inline-flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1"
          aria-label="Med Bazar Home"
        >
          <div className="w-12 h-12 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-brand-700 transition-colors">
            <Pill className="w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Med<span className="text-brand-600">Bazar</span>
          </span>
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900">
          Create Customer Account
        </h1>
        <p className="mt-1 text-xs text-gray-600">
          Register to order verified medications with genuine pharmacy doorstep delivery
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white border border-sand-300 rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
          {/* General Error Banner */}
          {errors.general && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div
              role="status"
              className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Account created! Redirecting to customer marketplace...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="reg-name"
                className="block text-xs font-semibold text-gray-700 tracking-wider select-none"
              >
                Full Name <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  disabled={isLoading || isSuccess}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g. Rajesh Sharma"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={`block w-full rounded-lg border text-xs font-sans pl-10 pr-3.5 py-2.5 transition-all duration-150 ${
                    errors.name
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-red-950 bg-red-50/20'
                      : 'border-sand-300 hover:border-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white text-gray-900'
                  } disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`}
                />
              </div>
              {errors.name && (
                <p id="name-error" role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-gray-700 tracking-wider select-none"
                >
                  Email Address <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading || isSuccess}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="rajesh@example.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={`block w-full rounded-lg border text-xs font-sans pl-10 pr-3.5 py-2.5 transition-all duration-150 ${
                      errors.email
                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-red-950 bg-red-50/20'
                        : 'border-sand-300 hover:border-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white text-gray-900'
                    } disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="reg-phone"
                  className="block text-xs font-semibold text-gray-700 tracking-wider select-none"
                >
                  Mobile Number <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    disabled={isLoading || isSuccess}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="+91 98765 43210"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                    className={`block w-full rounded-lg border text-xs font-sans pl-10 pr-3.5 py-2.5 transition-all duration-150 ${
                      errors.phone
                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-red-950 bg-red-50/20'
                        : 'border-sand-300 hover:border-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white text-gray-900'
                    } disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`}
                  />
                </div>
                {errors.phone && (
                  <p id="phone-error" role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="reg-password"
                className="block text-xs font-semibold text-gray-700 tracking-wider select-none"
              >
                Create Password <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isLoading || isSuccess}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="At least 8 characters"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`block w-full rounded-lg border text-xs font-sans pl-10 pr-10 py-2.5 transition-all duration-150 ${
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

              {/* Password Requirement Badges */}
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

            {/* Confirm Password */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="reg-confirm-password"
                className="block text-xs font-semibold text-gray-700 tracking-wider select-none"
              >
                Confirm Password <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isLoading || isSuccess}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="Re-enter your password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                  className={`block w-full rounded-lg border text-xs font-sans pl-10 pr-10 py-2.5 transition-all duration-150 ${
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

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="reg-terms"
                  checked={termsAccepted}
                  disabled={isLoading || isSuccess}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
                  }}
                  aria-describedby={errors.terms ? 'terms-error' : undefined}
                  className="w-4 h-4 mt-0.5 rounded border-sand-300 text-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-0 transition-colors"
                />
                <span className="text-xs text-gray-600 leading-normal">
                  I agree to Med Bazar's{' '}
                  <span className="font-semibold text-brand-700 hover:underline">Terms of Service</span>,{' '}
                  <span className="font-semibold text-brand-700 hover:underline">Privacy Policy</span>, and verified prescription handling terms.
                </span>
              </label>
              {errors.terms && (
                <p id="terms-error" role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1.5 pl-6">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.terms}</span>
                </p>
              )}
            </div>

            {/* Register CTA */}
            <Button
              type="submit"
              disabled={isLoading || isSuccess}
              isLoading={isLoading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg shadow-sm transition-all duration-150 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 mt-2"
              rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
            >
              {isSuccess ? 'Account Created' : 'Create My Account'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-2 border-t border-sand-200 text-xs text-gray-600">
            Already registered on Med Bazar?{' '}
            <Link
              to="/login"
              className="font-bold text-brand-700 hover:text-brand-800 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1"
            >
              Sign in to your account
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center flex items-center justify-center gap-1.5 text-xs text-gray-500 font-sans">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Patient Data Protected Under Healthcare Privacy Standards</span>
        </div>
      </div>
    </div>
  );
};
