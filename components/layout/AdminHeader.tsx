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
    <header className="bg-white border-b border-slate-200 shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile sidebar toggle */}
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Title and Breadcrumbs */}
          <div className="flex flex-col justify-center min-w-0">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="mb-1">
                <ol className="flex items-center space-x-2 text-sm text-slate-500">
                  {breadcrumbs.map((crumb, index) => (
                    <li key={index} className="flex items-center">
                      {index > 0 && (
                        <svg className="w-4 h-4 mx-2 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {crumb.href ? (
                        <Link href={crumb.href} className="hover:text-slate-700 transition-colors">
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-slate-900 font-medium">{crumb.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            {title && (
              <h1 className="text-xl font-semibold text-slate-900 truncate">
                {title}
              </h1>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Actions */}
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

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
