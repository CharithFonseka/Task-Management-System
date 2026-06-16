import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../context/NotificationContext';
import { useSocket } from '../hooks/useSocket';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markRead, markAllRead, fetchNotifications } = useNotifications();

  // Real-time socket updates
  useSocket(() => {
    fetchNotifications();
  });

  return (
    <aside className={`notif-panel ${isOpen ? 'notif-panel--open' : ''}`}>
      <div className="notif-panel__header">
        <div>
          <h2 className="notif-panel__title">Notifications</h2>
          {unreadCount > 0 && (
            <span className="notif-panel__count">{unreadCount} unread</span>
          )}
        </div>
        <div className="notif-panel__actions">
          {unreadCount > 0 && (
            <button className="btn btn--ghost btn--sm" onClick={markAllRead}>
              Mark all read
            </button>
          )}
          <button className="notif-panel__close" onClick={onClose} aria-label="Close notifications">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="notif-panel__list">
        {notifications.length === 0 ? (
          <div className="notif-panel__empty">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ opacity: 0.3 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-item ${!n.is_read ? 'notif-item--unread' : ''}`}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <div className="notif-item__dot" />
              <div className="notif-item__body">
                <p className="notif-item__message">{n.message}</p>
                <span className="notif-item__time">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default NotificationPanel;
