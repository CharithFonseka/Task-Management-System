import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const getStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

const ResetPasswordPage = () => {
  const { resetPassword, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const strength = getStrength(form.newPassword);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (strength < 2) {
      toast.error('Password is too weak');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(form.newPassword);
      toast.success('Password updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg">
        <div className="auth-page__blob auth-page__blob--1" />
        <div className="auth-page__blob auth-page__blob--2" />
      </div>

      <div className="auth-card">
        <div className="auth-card__logo">
          <div className="auth-card__logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="auth-card__logo-text">TaskFlow</span>
        </div>

        <div className="auth-card__header">
          <div className="auth-card__icon-wrap">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#6366f1">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="auth-card__title">Set your password</h1>
          <p className="auth-card__subtitle">This is your first login. Please create a secure password to continue.</p>
        </div>

        <form className="auth-card__form" onSubmit={handleSubmit} id="reset-password-form">
          <div className="form-group">
            <label className="form-label" htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              className="form-input"
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
            />

            {form.newPassword && (
              <div className="password-strength">
                <div className="password-strength__bars">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="password-strength__bar"
                      style={{ background: i <= strength ? STRENGTH_COLORS[strength] : 'rgba(255,255,255,0.1)' }}
                    />
                  ))}
                </div>
                <span className="password-strength__label" style={{ color: STRENGTH_COLORS[strength] }}>
                  {STRENGTH_LABELS[strength]}
                </span>
              </div>
            )}

            <ul className="password-hints">
              <li className={form.newPassword.length >= 8 ? 'hint--ok' : ''}>At least 8 characters</li>
              <li className={/[A-Z]/.test(form.newPassword) ? 'hint--ok' : ''}>One uppercase letter</li>
              <li className={/[0-9]/.test(form.newPassword) ? 'hint--ok' : ''}>One number</li>
              <li className={/[^A-Za-z0-9]/.test(form.newPassword) ? 'hint--ok' : ''}>One special character</li>
            </ul>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              className="form-input"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              required
            />
            {form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <p className="form-error">Passwords do not match</p>
            )}
          </div>

          <button
            id="reset-submit"
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Updating…</> : 'Set Password & Continue'}
          </button>
        </form>

        <button className="auth-card__back" onClick={() => { logout(); navigate('/login'); }}>
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
