import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { auth } from '../services/api';
import LogoIcon from '../components/LogoIcon';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await auth.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

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
          {submitted ? (
            // Success State
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-fresh-base/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-fresh-base" />
              </div>
              <h2 className="text-display-sm text-txt-primary mb-3">Check Your Email</h2>
              <p className="text-txt-secondary mb-6">
                If an account exists for <span className="font-medium text-txt-primary">{email}</span>,
                you'll receive a password reset link shortly.
              </p>
              <p className="text-sm text-txt-muted mb-8">
                The link will expire in 1 hour.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-accent-400 hover:text-accent-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          ) : (
            // Form State
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-400/10 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-accent-400" />
                </div>
                <h2 className="text-display-sm text-txt-primary mb-2">Forgot Password?</h2>
                <p className="text-txt-secondary">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-decayed-base/10 border border-decayed-base/30 text-decayed-base px-4 py-3 rounded-lg text-sm animate-slide-down">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-txt-secondary mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
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

export default ForgotPassword;
