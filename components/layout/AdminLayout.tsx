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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleUserMenuClick = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <div className="flex h-screen bg-neutral-50" {...props}>
      {/* Sidebar */}
      {sidebar && (
        <AdminSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
          currentPath={typeof window !== 'undefined' ? window.location.pathname : ''}
          user={user}
        />
      )}

      {/* Main Content */}
      <div className={cn(
        'flex-1 flex flex-col overflow-hidden transition-all duration-300',
        sidebar && !sidebarCollapsed && 'ml-0',
        sidebar && sidebarCollapsed && 'ml-0'
      )}>
        {/* Header */}
        <AdminHeader
          title={title}
          breadcrumbs={breadcrumbs}
          actions={actions}
          user={user}
          onSidebarToggle={handleSidebarToggle}
          onUserMenuClick={handleUserMenuClick}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="container-responsive py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebar && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
};

export default AdminLayout;