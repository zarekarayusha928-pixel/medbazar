import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pill, Mail, Phone, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { authApi } from '@/services/api/authApi';

export const ForgotPasswordPage: React.FC = () => {
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState(''); // email or phone
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!identifier.trim()) {
      setError('Please enter your registered email address or mobile number.');
      return false;
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
    const isPhone = /^[0-9+\s-]{10,15}$/.test(identifier.trim());
    if (!isEmail && !isPhone) {
      setError('Please enter a valid email format (e.g. name@example.com) or 10-digit mobile number.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await authApi.forgotPassword(identifier.trim());
      setIsSuccess(true);
      showToast('Instructions Sent', res.message || `Recovery steps dispatched for ${identifier.trim()}`, 'success');
    } catch {
      setError('Unable to send reset instructions at this time. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(identifier.trim());
      showToast('Code Resent', `New recovery instructions sent to ${identifier.trim()}`, 'info');
    } catch {
      showToast('Error', 'Unable to resend instructions right now.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
          Recover Password
        </h1>
        <p className="mt-1 text-xs text-gray-600">
          Enter your registered details to receive secure password recovery instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-sand-300 rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
          {isSuccess ? (
            /* Success State Card */
            <div className="text-center space-y-5 py-2 animate-fadeIn" role="status">
              <div className="w-14 h-14 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg font-extrabold text-gray-900">Instructions Dispatched</h2>
                <p className="text-xs text-gray-600 leading-relaxed">
                  We have dispatched secure recovery instructions to{' '}
                  <span className="font-bold text-gray-900 font-mono">{identifier}</span>.
                </p>
                <p className="text-[11px] text-gray-500">
                  Please check your inbox or SMS messages. The reset link is valid for 15 minutes.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <Link to="/reset-password">
                  <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg shadow-sm">
                    Continue to Reset Password Screen
                  </Button>
                </Link>

                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-xs text-brand-700 hover:text-brand-800 font-semibold flex items-center gap-1 hover:underline disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Resend instructions</span>
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setIdentifier('');
                    }}
                    className="text-xs text-gray-600 hover:text-gray-900 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1"
                  >
                    Change email/phone
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-sand-200">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Default / Form State */
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Error Banner */}
              {error && (
                <div
                  role="alert"
                  className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email / Phone Input */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="forgot-identifier"
                  className="block text-xs font-semibold text-gray-700 tracking-wider select-none"
                >
                  Registered Email Address or Mobile Number <span className="text-red-500" aria-hidden="true">*</span>
                </label>

                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    {identifier.includes('@') ? (
                      <Mail className="w-4 h-4" />
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                  </div>

                  <input
                    id="forgot-identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    disabled={isLoading}
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="e.g. rajesh@example.com or 9876543210"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'forgot-error' : 'forgot-helper'}
                    className={`block w-full rounded-lg border text-xs font-sans pl-10 pr-3.5 py-2.5 transition-all duration-150 ${
                      error
                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-red-950 bg-red-50/20'
                        : 'border-sand-300 hover:border-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white text-gray-900'
                    } disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`}
                  />
                </div>

                <p id="forgot-helper" className="text-[11px] text-gray-500 mt-1">
                  We'll verify your registered account and send an authentication reset link.
                </p>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg shadow-sm transition-all duration-150 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 mt-2"
                rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
              >
                Send Password Reset Instructions
              </Button>

              <div className="text-center pt-2 border-t border-sand-200">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Remember your password? Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center flex items-center justify-center gap-1.5 text-xs text-gray-500 font-sans">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted Account Recovery Protocol</span>
        </div>
      </div>
    </div>
  );
};
