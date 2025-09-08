import React from 'react';
import Link from 'next/link';
import { AdminHeaderProps } from '@/types/admin';
import Button from '../ui/Button';
import UserMenu from './UserMenu';
import Breadcrumbs from '../ui/Breadcrumbs';

const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  breadcrumbs,
  actions,
  user,
  onSidebarToggle,
  sidebarOpen
}) => {
  return (
    <header className="admin-header sticky top-0 z-20 bg-white">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile sidebar toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="lg:hidden text-slate-600 hover:text-slate-900"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            }
          />

          {/* Title and Breadcrumbs */}
          <div className="flex flex-col">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumbs items={breadcrumbs} className="mb-1" />
            )}
            {title && (
              <h1 className="text-xl font-semibold text-slate-900">
                {title}
              </h1>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Actions */}
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative text-slate-600 hover:text-slate-900"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
          >
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <UserMenu
            user={user}
            onProfileClick={() => {}}
            onSettingsClick={() => {}}
            onLogout={() => {}}
            isOpen={false}
            onClose={() => {}}
          />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
