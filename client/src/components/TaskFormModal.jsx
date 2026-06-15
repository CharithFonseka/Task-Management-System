import React, { useState, useEffect } from 'react';
import { createTask, updateTask } from '../api/taskApi';
import { getAllUsers } from '../api/userApi';
import toast from 'react-hot-toast';

const INITIAL_FORM = {
  title: '',
  description: '',
  assigned_to: '',
  priority: 'Medium',
  status: 'To Do',
  due_date: '',
};

const TaskFormModal = ({ isOpen, onClose, task, onSuccess }) => {

  const [form, setForm] = useState(INITIAL_FORM);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const isEdit = !!task;

  useEffect(() => {
    if (isOpen) {
      setForm(
        task
          ? {
              title: task.title || '',
              description: task.description || '',
              assigned_to: task.assigned_to || '',
              priority: task.priority || 'Medium',
              status: task.status || 'To Do',
              due_date: task.due_date || '',
            }
          : INITIAL_FORM
      );
      // Fetch users for assignee dropdown
      getAllUsers()
        .then((res) => setUsers(res.data.data || []))
        .catch(() => {});
    }
  }, [isOpen, task]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await updateTask(task.id, form);
        toast.success('Task updated successfully');
      } else {
        await createTask(form);
        toast.success('Task created successfully');
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
          <h2 className="modal__title">{isEdit ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="modal__close" onClick={onClose}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="modal__body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title <span className="required">*</span></label>
            <input
              className="form-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input form-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the task…"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" name="priority" value={form.priority} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-input" name="assigned_to" value={form.assigned_to} onChange={handleChange}>
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                className="form-input"
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (isEdit ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
