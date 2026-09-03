import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LogoMark from '../components/LogoMark';
import { authService } from '../services/api';

const AuthPage = ({ darkMode, toggleDark }) => {
  const [tab, setTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email');
      return;
    }
    setForgotLoading(true);
    try {
      await authService.forgotPassword(forgotEmail);
      toast.success('If an account exists for that email, a reset link has been sent.');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (tab === 'register' && !form.name) {
      toast.error('Name is required');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back! 👋');
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created successfully! 🎉');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (newTab) => {
    setTab(newTab);
    setForm({ name: '', email: '', password: '' });
    setShowPassword(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-blob auth-bg-blob-1" />
      <div className="auth-bg-blob auth-bg-blob-2" />

      {/* Dark mode toggle in auth page */}
      <button
        className="auth-theme-toggle"
        onClick={toggleDark}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
        {darkMode ? 'Light' : 'Dark'}
      </button>

      <div className="auth-card fade-in">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <LogoMark size={38} />
          </div>
          <h1>ExpenseTracker</h1>
          <p>{tab === 'login' ? 'Sign in to manage your expenses' : 'Create your free account'}</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>
            Sign In
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')}>
            Register
          </button>
        </div>

        {tab === 'login' && showForgotPassword ? (
          <form onSubmit={handleForgotPasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="auth-input-wrap">
                <FiMail className="auth-input-icon" />
                <input
                  id="forgot-email"
                  className="form-control auth-input-with-icon"
                  type="email"
                  name="forgotEmail"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              id="forgot-password-submit-btn"
              type="submit"
              className="btn btn-primary btn-lg auth-submit-btn"
              disabled={forgotLoading}
            >
              {forgotLoading ? (
                <>
                  <span className="spinner spinner-sm" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <button
              type="button"
              className="auth-forgot-link"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotEmail('');
              }}
            >
              Back to Sign In
            </button>
          </form>
        ) : (
        <>
        {/* Form */}
        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="auth-input-wrap">
                <FiUser className="auth-input-icon" />
                <input
                  id="reg-name"
                  className="form-control auth-input-with-icon"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="auth-input-wrap">
              <FiMail className="auth-input-icon" />
              <input
                id="auth-email"
                className="form-control auth-input-with-icon"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="auth-input-wrap">
              <FiLock className="auth-input-icon" />
              <input
                id="auth-password"
                className="form-control auth-input-with-icon auth-input-with-trailing"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            className="btn btn-primary btn-lg auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm" />
                {tab === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              tab === 'login' ? '🚀 Sign In' : '✨ Create Account'
            )}
          </button>
        </form>

        {tab === 'login' && (
          <button
            type="button"
            className="auth-forgot-link"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot password?
          </button>
        )}

        {tab === 'login' && (
          <div className="auth-demo-note">
            <p>
              <strong>Demo credentials:</strong><br />
              Register with any email/password to get started!
            </p>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
