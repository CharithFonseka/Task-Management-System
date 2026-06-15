import React from 'react';
import { useLocation } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Task Board',
  '/users': 'User Management',
};

const TopBar = ({ onNotificationClick }) => {
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const title = Object.entries(pageTitles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || 'TaskFlow';

  return (
    <header className="topbar">
      <div className="topbar__left">
        <h1 className="topbar__title">{title}</h1>
        <div className="topbar__breadcrumb">
          <span>Home</span>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>{title}</span>
        </div>
      </div>

      <div className="topbar__right">
        <button
          id="notification-bell"
          className="topbar__icon-btn"
          onClick={onNotificationClick}
          aria-label="Notifications"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="topbar__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
