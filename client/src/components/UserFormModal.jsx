import React, { useState, useEffect } from 'react';
import { createUser, updateUser } from '../api/userApi';
import toast from 'react-hot-toast';

const INITIAL_FORM = { name: '', email: '', role: 'Collaborator' };

const UserFormModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const isEdit = !!user;

  useEffect(() => {
    if (isOpen) {
      setForm(
        user
          ? { name: user.name || '', email: user.email || '', role: user.role || 'Collaborator' }
          : INITIAL_FORM
      );
    }
  }, [isOpen, user]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await updateUser(user.id, { name: form.name, role: form.role });
        toast.success('User updated successfully');
      } else {
        await createUser(form);
        toast.success('User created — a temporary password has been emailed');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{isEdit ? 'Edit User' : 'Add New User'}</h2>
          <button className="modal__close" onClick={onClose}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="modal__body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name <span className="required">*</span></label>
            <input
              className="form-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          {!isEdit && (
            <div className="form-group">
              <label className="form-label">Email <span className="required">*</span></label>
              <input
                className="form-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@company.com"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Role <span className="required">*</span></label>
            <select className="form-input" name="role" value={form.role} onChange={handleChange}>
              <option value="Admin">Admin</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Collaborator">Collaborator</option>
            </select>
          </div>

          {!isEdit && (
            <div className="info-box">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              A temporary password will be emailed to the user. They will be asked to reset it on first login.
            </div>
          )}

          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (isEdit ? 'Save Changes' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
