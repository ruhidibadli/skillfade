import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Eye, EyeOff, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { auth } from '../services/api';
import LogoIcon from '../components/LogoIcon';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!token) {
      setError('Invalid reset link');
      return;
    }

    setLoading(true);

    try {
      await auth.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Invalid or missing token
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh relative">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-accent-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-secondary-400/5 rounded-full blur-3xl" />

        <div className="absolute top-0 left-0 right-0 p-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-secondary-400 flex items-center justify-center shadow-glow-accent">
              <LogoIcon className="w-5 h-5 text-surface-50" />
            </div>
            <span className="text-xl font-bold text-txt-primary">SkillFade</span>
            <span className="tag-accent text-[10px] uppercase tracking-wider">Beta</span>
          </Link>
        </div>

        <div className="relative max-w-md w-full mx-4">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-400/5 to-secondary-400/5 blur-xl" />
          <div className="relative card-elevated p-8 animate-scale-in text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-decayed-base/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-decayed-base" />
            </div>
            <h2 className="text-display-sm text-txt-primary mb-3">Invalid Reset Link</h2>
            <p className="text-txt-secondary mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link
              to="/forgot-password"
              className="btn-primary inline-flex items-center gap-2"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh relative">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-accent-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-secondary-400/5 rounded-full blur-3xl" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-secondary-400 flex items-center justify-center shadow-glow-accent">
            <LogoIcon className="w-5 h-5 text-surface-50" />
          </div>
          <span className="text-xl font-bold text-txt-primary">SkillFade</span>
          <span className="tag-accent text-[10px] uppercase tracking-wider">Beta</span>
        </Link>
      </div>

      {/* Form Card */}
      <div className="relative max-w-md w-full mx-4">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-400/5 to-secondary-400/5 blur-xl" />
        <div className="relative card-elevated p-8 animate-scale-in">
          {success ? (
            // Success State
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-fresh-base/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-fresh-base" />
              </div>
              <h2 className="text-display-sm text-txt-primary mb-3">Password Reset!</h2>
              <p className="text-txt-secondary mb-8">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary w-full py-3 text-lg"
              >
                Sign In
              </button>
            </div>
          ) : (
            // Form State
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-400/10 flex items-center justify-center">
                  <KeyRound className="w-8 h-8 text-accent-400" />
                </div>
                <h2 className="text-display-sm text-txt-primary mb-2">Set New Password</h2>
                <p className="text-txt-secondary">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-decayed-base/10 border border-decayed-base/30 text-decayed-base px-4 py-3 rounded-lg text-sm animate-slide-down">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-txt-secondary mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pr-12"
                      placeholder="Enter new password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-txt-muted hover:text-txt-secondary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-txt-muted">At least 8 characters</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-txt-secondary mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input pr-12"
                      placeholder="Confirm new password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-txt-muted hover:text-txt-secondary transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                <div className="text-center pt-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-txt-muted hover:text-txt-secondary transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
