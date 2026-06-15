import React, { useEffect, useState, useCallback } from 'react';
import { getAllUsers, deactivateUser } from '../api/userApi';
import AppLayout from '../components/Layout/AppLayout';
import UserFormModal from '../components/UserFormModal';
import toast from 'react-hot-toast';

const ROLE_STYLES = {
  Admin: { color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  'Project Manager': { color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  Collaborator: { color: '#14b8a6', bg: 'rgba(20,184,166,0.15)' },
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(res.data.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    let result = [...users];
    if (search) result = result.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
    if (roleFilter) result = result.filter((u) => u.role === roleFilter);
    setFiltered(result);
  }, [users, search, roleFilter]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDeactivate = async (userId) => {
    try {
      await deactivateUser(userId);
      toast.success('User deactivated');
      setConfirmDeactivate(null);
      fetchUsers();
    } catch {
      toast.error('Failed to deactivate user');
    }
  };

  const openCreate = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  return (
    <AppLayout>
      <div className="page">
        <div className="page__header">
          <div>
            <h2 className="page__title">User Management</h2>
            <p className="page__subtitle">Manage team members and their roles</p>
          </div>
          <button id="add-user-btn" className="btn btn--primary" onClick={openCreate}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="search-wrap">
            <svg className="search-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="user-search"
              className="form-input search-input"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            id="role-filter"
            className="form-input filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Collaborator">Collaborator</option>
          </select>
          <span className="filter-count">{filtered.length} users</span>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 32 }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8 }} />)}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <p>No users found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => {
                    const rs = ROLE_STYLES[user.role] || ROLE_STYLES.Collaborator;
                    return (
                      <tr key={user.id} className="data-table__row">
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar" style={{ background: `linear-gradient(135deg, ${rs.color}, ${rs.color}80)` }}>
                              {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="user-name">{user.name}</span>
                          </div>
                        </td>
                        <td className="text-muted">{user.email}</td>
                        <td>
                          <span className="role-badge" style={{ color: rs.color, background: rs.bg }}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-indicator ${user.is_active ? 'status-indicator--active' : 'status-indicator--inactive'}`}>
                            <span className="status-indicator__dot" />
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button
                              className="btn btn--ghost btn--sm"
                              onClick={() => handleEdit(user)}
                              title="Edit user"
                            >
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            {user.is_active && (
                              <button
                                className="btn btn--danger btn--sm"
                                onClick={() => setConfirmDeactivate(user)}
                                title="Deactivate user"
                              >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Deactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      {/* Confirm Deactivate Dialog */}
      {confirmDeactivate && (
        <div className="modal-backdrop" onClick={() => setConfirmDeactivate(null)}>
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Deactivate User</h2>
            </div>
            <div className="modal__body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                Are you sure you want to deactivate <strong style={{ color: 'var(--text-primary)' }}>{confirmDeactivate.name}</strong>?
                They will no longer be able to log in.
              </p>
              <div className="modal__footer">
                <button className="btn btn--ghost" onClick={() => setConfirmDeactivate(null)}>Cancel</button>
                <button className="btn btn--danger" onClick={() => handleDeactivate(confirmDeactivate.id)}>
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default UsersPage;
