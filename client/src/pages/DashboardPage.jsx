import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTasks } from '../api/taskApi';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/Layout/AppLayout';
import { format, isPast, parseISO } from 'date-fns';

const StatCard = ({ label, value, color, icon, delay }) => (
  <div className="stat-card" style={{ animationDelay: delay }}>
    <div className="stat-card__icon" style={{ background: `${color}20`, color }}>
      {icon}
    </div>
    <div className="stat-card__body">
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
    <div className="stat-card__bar" style={{ background: `linear-gradient(90deg, ${color}40, transparent)` }} />
  </div>
);

const PRIORITY_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
const STATUS_COLORS = { 'To Do': '#6366f1', 'In Progress': '#f59e0b', 'Completed': '#10b981' };

const DashboardPage = () => {
  const { user, canManageTasks } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTasks()
      .then((res) => setTasks(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'To Do').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
  };

  const priorityCounts = {
    High: tasks.filter((t) => t.priority === 'High').length,
    Medium: tasks.filter((t) => t.priority === 'Medium').length,
    Low: tasks.filter((t) => t.priority === 'Low').length,
  };

  const overdueTasks = tasks.filter(
    (t) => t.due_date && isPast(parseISO(t.due_date)) && t.status !== 'Completed'
  );

  const recentTasks = [...tasks].slice(0, 6);

  const totalForBar = Math.max(priorityCounts.High + priorityCounts.Medium + priorityCounts.Low, 1);

  return (
    <AppLayout>
      <div className="page">
        <div className="page__header">
          <div>
            <h2 className="page__title">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
            </h2>
            <p className="page__subtitle">Here's what's happening with your projects today.</p>
          </div>
          {canManageTasks && (
            <button className="btn btn--primary" onClick={() => navigate('/tasks')}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          )}
        </div>

        {/* Stats */}
        {loading ? (
          <div className="loading-grid">
            {[1,2,3,4].map(i => <div key={i} className="skeleton stat-card" />)}
          </div>
        ) : (
          <div className="stats-grid">
            <StatCard label="Total Tasks" value={counts.total} color="#6366f1" delay="0ms"
              icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            />
            <StatCard label="To Do" value={counts.todo} color="#6366f1" delay="100ms"
              icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <StatCard label="In Progress" value={counts.inProgress} color="#f59e0b" delay="200ms"
              icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            />
            <StatCard label="Completed" value={counts.completed} color="#10b981" delay="300ms"
              icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
          </div>
        )}

        <div className="dashboard-grid">
          {/* Priority breakdown */}
          <div className="card">
            <h3 className="card__title">Priority Breakdown</h3>
            <div className="priority-chart">
              {Object.entries(priorityCounts).map(([prio, count]) => (
                <div key={prio} className="priority-row">
                  <span className="priority-row__label">{prio}</span>
                  <div className="priority-row__bar-wrap">
                    <div
                      className="priority-row__bar"
                      style={{
                        width: `${(count / totalForBar) * 100}%`,
                        background: PRIORITY_COLORS[prio],
                      }}
                    />
                  </div>
                  <span className="priority-row__count">{count}</span>
                </div>
              ))}
            </div>

            {/* Status donut indicators */}
            <div className="status-legend">
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <div key={status} className="status-legend__item">
                  <span className="status-legend__dot" style={{ background: color }} />
                  <span>{status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Overdue tasks */}
          <div className="card">
            <h3 className="card__title">
              Overdue Tasks
              {overdueTasks.length > 0 && (
                <span className="badge badge--danger" style={{ marginLeft: 8 }}>{overdueTasks.length}</span>
              )}
            </h3>
            {overdueTasks.length === 0 ? (
              <div className="empty-state">
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ opacity: 0.3 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No overdue tasks!</p>
              </div>
            ) : (
              <div className="task-list">
                {overdueTasks.map((task) => (
                  <div key={task.id} className="task-list__item" onClick={() => navigate(`/tasks/${task.id}`)}>
                    <div>
                      <p className="task-list__title">{task.title}</p>
                      <p className="task-list__meta overdue-text">
                        Due {format(parseISO(task.due_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className={`badge badge--${task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'success'}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent tasks */}
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card__header">
            <h3 className="card__title">Recent Tasks</h3>
            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/tasks')}>
              View All →
            </button>
          </div>
          {loading ? (
            <div className="skeleton-list">
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8 }} />)}
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet. Create your first task!</p>
            </div>
          ) : (
            <div className="task-table">
              <div className="task-table__head">
                <span>Task</span>
                <span>Assignee</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Due Date</span>
              </div>
              {recentTasks.map((task) => (
                <div key={task.id} className="task-table__row" onClick={() => navigate(`/tasks/${task.id}`)}>
                  <span className="task-table__title">{task.title}</span>
                  <span className="task-table__assignee">
                    {task.assignee ? (
                      <span className="mini-avatar">{task.assignee.name?.charAt(0)}</span>
                    ) : '—'}
                    {task.assignee?.name || ''}
                  </span>
                  <span>
                    <span className={`badge badge--${task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'success'}`}>
                      {task.priority}
                    </span>
                  </span>
                  <span>
                    <span className="status-pill" style={{ background: `${STATUS_COLORS[task.status]}20`, color: STATUS_COLORS[task.status] }}>
                      {task.status}
                    </span>
                  </span>
                  <span className="task-table__date">
                    {task.due_date ? format(parseISO(task.due_date), 'MMM d, yyyy') : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
