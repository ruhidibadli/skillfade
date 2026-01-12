import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login');
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
            <Sparkles className="w-5 h-5 text-surface-50" />
          </div>
          <span className="text-xl font-bold text-txt-primary">SkillFade</span>
          <span className="tag-accent text-[10px] uppercase tracking-wider">Beta</span>
        </Link>
      </div>

      {/* Form Card */}
      <div className="relative max-w-md w-full mx-4">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-400/5 to-secondary-400/5 blur-xl" />
        <div className="relative card-elevated p-8 animate-scale-in">
          <div className="text-center mb-8">
            <h2 className="text-display-sm text-txt-primary mb-2">Welcome Back</h2>
            <p className="text-txt-secondary">Sign in to continue tracking</p>
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-txt-secondary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-sm text-txt-muted">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-accent-400 hover:text-accent-300 transition-colors">
                  Create one now
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
