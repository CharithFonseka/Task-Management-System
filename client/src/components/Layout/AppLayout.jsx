import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import NotificationPanel from '../NotificationPanel';

const AppLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'app-layout--collapsed' : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />
      <div className="app-layout__main">
        <TopBar onNotificationClick={() => setNotifOpen(true)} />
        <main className="app-layout__content">
          {children}
        </main>
      </div>
      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
      {notifOpen && (
        <div className="overlay" onClick={() => setNotifOpen(false)} />
      )}
    </div>
  );
};

export default AppLayout;
