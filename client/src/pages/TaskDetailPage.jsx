import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskById, updateTask, updateTaskStatus, deleteTask } from '../api/taskApi';
import { getCommentsByTask, createComment, deleteComment } from '../api/commentApi';
import { getAttachmentsByTask } from '../api/attachmentApi';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/Layout/AppLayout';
import TaskFormModal from '../components/TaskFormModal';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const PRIORITY_STYLES = {
  High: { cls: 'badge--danger' },
  Medium: { cls: 'badge--warning' },
  Low: { cls: 'badge--success' },
};

const STATUS_COLORS = {
  'To Do': '#6366f1',
  'In Progress': '#f59e0b',
  'Completed': '#10b981',
};

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canManageTasks, isCollaborator, user } = useAuth();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [taskRes, commentsRes, attachRes] = await Promise.all([
        getTaskById(id),
        getCommentsByTask(id),
        getAttachmentsByTask(id),
      ]);
      setTask(taskRes.data.data);
      setComments(commentsRes.data.data || []);
      setAttachments(attachRes.data.data || []);
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('Task not found');
        navigate('/tasks');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    try {
      if (isCollaborator) {
        await updateTaskStatus(id, newStatus);
      } else {
        await updateTask(id, { ...task, status: newStatus });
      }
      setTask((t) => ({ ...t, status: newStatus }));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      navigate('/tasks');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      await createComment({ task_id: id, content: newComment });
      setNewComment('');
      const res = await getCommentsByTask(id);
      setComments(res.data.data || []);
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((c) => c.filter((cm) => cm.id !== commentId));
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const canEditTask = canManageTasks;
  const canUpdateStatus = isCollaborator && task?.assigned_to === user?.id;
  const showStatusControl = canEditTask || canUpdateStatus;

  if (loading) {
    return (
      <AppLayout>
        <div className="page">
          <div className="skeleton" style={{ height: 48, width: 200, marginBottom: 24 }} />
          <div className="detail-grid">
            <div className="skeleton" style={{ height: 400 }} />
            <div className="skeleton" style={{ height: 400 }} />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!task) return null;

  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;
  const statusColor = STATUS_COLORS[task.status] || '#6366f1';

  return (
    <AppLayout>
      <div className="page">
        {/* Back button */}
        <button className="btn btn--ghost btn--sm back-btn" onClick={() => navigate('/tasks')}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Board
        </button>

        <div className="detail-grid">
          {/* Left: Task Details */}
          <div>
            <div className="card">
              <div className="card__header">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span className={`badge ${priorityStyle.cls}`}>{task.priority}</span>
                    <span className="status-pill" style={{ background: `${statusColor}20`, color: statusColor }}>
                      {task.status}
                    </span>
                  </div>
                  <h2 className="detail-title">{task.title}</h2>
                </div>
                {canEditTask && (
                  <div className="action-btns">
                    <button className="btn btn--ghost btn--sm" onClick={() => setEditModalOpen(true)}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button className="btn btn--danger btn--sm" onClick={() => setDeleteConfirm(true)}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {task.description && (
                <p className="detail-desc">{task.description}</p>
              )}

              <div className="detail-meta-grid">
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Assigned To</span>
                  <span className="detail-meta-value">
                    {task.assignee ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="mini-avatar">{task.assignee.name?.charAt(0)}</span>
                        {task.assignee.name}
                      </span>
                    ) : '—'}
                  </span>
                </div>
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Due Date</span>
                  <span className="detail-meta-value">
                    {task.due_date ? format(parseISO(task.due_date), 'MMM d, yyyy') : '—'}
                  </span>
                </div>
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Project</span>
                  <span className="detail-meta-value">{task.Project?.title || '—'}</span>
                </div>
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Created</span>
                  <span className="detail-meta-value">
                    {task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy') : '—'}
                  </span>
                </div>
              </div>

              {/* Status change for collaborator */}
              {showStatusControl && (
                <div className="detail-status-section">
                  <label className="form-label">Update Status</label>
                  <div className="status-btn-group">
                    {['To Do', 'In Progress', 'Completed'].map((s) => (
                      <button
                        key={s}
                        className={`status-btn ${task.status === s ? 'status-btn--active' : ''}`}
                        style={task.status === s ? { borderColor: STATUS_COLORS[s], color: STATUS_COLORS[s], background: `${STATUS_COLORS[s]}15` } : {}}
                        onClick={() => handleStatusChange(s)}
                        disabled={statusUpdating || task.status === s}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Attachments */}
            <div className="card" style={{ marginTop: 20 }}>
              <h3 className="card__title">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight: 6 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Attachments ({attachments.length})
              </h3>
              {attachments.length === 0 ? (
                <p className="text-muted" style={{ fontSize: 14 }}>No attachments</p>
              ) : (
                <div className="attachment-list">
                  {attachments.map((a) => (
                    <div key={a.id} className="attachment-item">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="attachment-link">
                        {a.file_name || a.file_url}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Comments */}
          <div className="card">
            <h3 className="card__title">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight: 6 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Comments ({comments.length})
            </h3>

            <div className="comment-list">
              {comments.length === 0 ? (
                <div className="empty-state">
                  <p>No comments yet. Be the first!</p>
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="comment">
                    <div className="comment__avatar">
                      {c.User?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="comment__body">
                      <div className="comment__header">
                        <span className="comment__author">{c.User?.name || 'Unknown'}</span>
                        <span className="comment__time">
                          {c.createdAt ? format(new Date(c.createdAt), 'MMM d, h:mm a') : ''}
                        </span>
                      </div>
                      <p className="comment__text">{c.content}</p>
                    </div>
                    {c.user_id === user?.id && (
                      <button
                        className="comment__delete"
                        onClick={() => handleDeleteComment(c.id)}
                        title="Delete comment"
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add comment form */}
            <form className="comment-form" onSubmit={handleAddComment}>
              <div className="comment__avatar comment__avatar--self">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="comment-form__input-wrap">
                <textarea
                  className="form-input form-textarea"
                  placeholder="Write a comment…"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                />
                <button
                  type="submit"
                  className="btn btn--primary btn--sm"
                  disabled={commentLoading || !newComment.trim()}
                >
                  {commentLoading ? <span className="spinner" /> : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <TaskFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        task={task}
        onSuccess={fetchAll}
      />

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(false)}>
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Delete Task</h2>
            </div>
            <div className="modal__body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                Are you sure you want to permanently delete <strong style={{ color: 'var(--text-primary)' }}>"{task.title}"</strong>?
                This cannot be undone.
              </p>
              <div className="modal__footer">
                <button className="btn btn--ghost" onClick={() => setDeleteConfirm(false)}>Cancel</button>
                <button className="btn btn--danger" onClick={handleDeleteTask}>Delete Task</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default TaskDetailPage;
