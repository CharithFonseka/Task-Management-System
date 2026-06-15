import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/Layout/AppLayout';
import toast from 'react-hot-toast';

const getRoleColor = (role) => {
  if (role === 'Admin') return '#6366f1';
  if (role === 'Project Manager') return '#8b5cf6';
  return '#14b8a6';
};
const getRoleBg = (role) => {
  if (role === 'Admin') return 'rgba(99,102,241,0.15)';
  if (role === 'Project Manager') return 'rgba(139,92,246,0.15)';
  return 'rgba(20,184,166,0.15)';
};

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  // Name form state
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  // Password form state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleNameSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    if (name.trim() === user?.name) return toast.error('No changes detected');
    try {
      setSavingName(true);
      await updateProfile({ name: name.trim() });
      toast.success('Name updated successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw)
      return toast.error('All password fields are required');
    if (newPw.length < 8)
      return toast.error('New password must be at least 8 characters');
    if (newPw !== confirmPw)
      return toast.error('Passwords do not match');
    try {
      setSavingPw(true);
      await updateProfile({ current_password: currentPw, new_password: newPw });
      toast.success('Password changed successfully!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  const pwStrength = () => {
    if (!newPw) return 0;
    let s = 0;
    if (newPw.length >= 8) s++;
    if (/[A-Z]/.test(newPw)) s++;
    if (/[0-9]/.test(newPw)) s++;
    if (/[^A-Za-z0-9]/.test(newPw)) s++;
    return s;
  };
  const strength = pwStrength();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#6366f1', '#10b981'][strength];

  return (
    <AppLayout>
      <div className="page">
        <div className="page__header">
          <div>
            <h2 className="page__title">My Profile</h2>
            <p className="page__subtitle">Manage your personal information and security settings</p>
          </div>
        </div>

        <div className="profile-layout">
          {/* Left — Identity card */}
          <div className="profile-identity card">
            <div className="profile-avatar-wrap">
              <div
                className="profile-avatar"
                style={{ background: `linear-gradient(135deg, ${getRoleColor(user?.role)}, ${getRoleColor(user?.role)}99)` }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="profile-avatar__ring" style={{ borderColor: getRoleColor(user?.role) }} />
            </div>
            <h3 className="profile-name">{user?.name}</h3>
            <p className="profile-email">{user?.email}</p>
            <span
              className="profile-role-badge"
              style={{ color: getRoleColor(user?.role), background: getRoleBg(user?.role), borderColor: `${getRoleColor(user?.role)}40` }}
            >
              {user?.role}
            </span>

            <div className="profile-meta">
              <div className="profile-meta__item">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user?.email}
              </div>
              <div className="profile-meta__item">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Account Active
              </div>
            </div>
          </div>

          {/* Right — Settings panels */}
          <div className="profile-settings">
            {/* Name */}
            <div className="card profile-section">
              <div className="profile-section__header">
                <div className="profile-section__icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="profile-section__title">Personal Information</h3>
                  <p className="profile-section__subtitle">Update your display name</p>
                </div>
              </div>
              <form onSubmit={handleNameSave} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="required">*</span></label>
                    <input
                      id="profile-name"
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      maxLength={100}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
                    <span className="form-error" style={{ color: 'var(--text-muted)' }}>Email cannot be changed</span>
                  </div>
                </div>
                <div className="profile-form__actions">
                  <button
                    id="save-name-btn"
                    type="submit"
                    className="btn btn--primary"
                    disabled={savingName}
                  >
                    {savingName ? <><span className="spinner" /> Saving…</> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Password */}
            <div className="card profile-section">
              <div className="profile-section__header">
                <div className="profile-section__icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="profile-section__title">Change Password</h3>
                  <p className="profile-section__subtitle">Keep your account secure with a strong password</p>
                </div>
              </div>
              <form onSubmit={handlePasswordSave} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Current Password <span className="required">*</span></label>
                  <div className="form-input-wrap">
                    <input
                      id="current-password"
                      className="form-input"
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="Enter current password"
                      autoComplete="current-password"
                    />
                    <button type="button" className="form-input-toggle" onClick={() => setShowCurrent(p => !p)}>
                      {showCurrent
                        ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      }
                    </button>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">New Password <span className="required">*</span></label>
                    <div className="form-input-wrap">
                      <input
                        id="new-password"
                        className="form-input"
                        type={showNew ? 'text' : 'password'}
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        placeholder="Minimum 8 characters"
                        autoComplete="new-password"
                      />
                      <button type="button" className="form-input-toggle" onClick={() => setShowNew(p => !p)}>
                        {showNew
                          ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                          : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        }
                      </button>
                    </div>
                    {newPw && (
                      <div className="password-strength">
                        <div className="password-strength__bars">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="password-strength__bar"
                              style={{ background: i <= strength ? strengthColor : 'rgba(255,255,255,0.08)' }} />
                          ))}
                        </div>
                        <span className="password-strength__label" style={{ color: strengthColor }}>{strengthLabel}</span>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password <span className="required">*</span></label>
                    <input
                      id="confirm-password"
                      className="form-input"
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="Repeat new password"
                      autoComplete="new-password"
                    />
                    {confirmPw && newPw !== confirmPw && (
                      <span className="form-error">Passwords do not match</span>
                    )}
                  </div>
                </div>
                <div className="profile-form__actions">
                  <button
                    id="save-password-btn"
                    type="submit"
                    className="btn btn--primary"
                    disabled={savingPw}
                  >
                    {savingPw ? <><span className="spinner" /> Updating…</> : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
