'use client';

import React, { useState } from 'react';
import { AdminLayoutProps } from '@/types/admin';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { cn } from '@/lib/utils';

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  breadcrumbs,
  actions,
  sidebar = true,
  user,
  ...props
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50" {...props}>
      {/* Sidebar */}
      {sidebar && (
        <AdminSidebar
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
          currentPath={typeof window !== 'undefined' ? window.location.pathname : ''}
          user={user}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader
          title={title}
          breadcrumbs={breadcrumbs}
          actions={actions}
          user={user}
          onSidebarToggle={handleSidebarToggle}
          sidebarOpen={sidebarOpen}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebar && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}
    </div>
  );
};

export default AdminLayout;
