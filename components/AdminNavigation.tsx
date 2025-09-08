'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

interface AdminNavigationProps {
  locale: string;
}

export function AdminNavigation({ locale }: AdminNavigationProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations('admin.navigation');

  const isActive = (path: string) => pathname === path;
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  const navigationItems = [
    {
      name: t('dashboard'),
      path: `/${locale}/admin`,
      icon: '📊',
      allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    },
    {
      name: t('inquiries'),
      path: `/${locale}/admin/inquiries`,
      icon: '📧',
      allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    },
    {
      name: t('categories'),
      path: `/${locale}/admin/categories`,
      icon: '📁',
      allowedRoles: ['SUPER_ADMIN'],
    },
    {
      name: t('products'),
      path: `/${locale}/admin/products`,
      icon: '🛍️',
      allowedRoles: ['SUPER_ADMIN'],
    },
    {
      name: t('users'),
      path: `/${locale}/admin/users`,
      icon: '👥',
      allowedRoles: ['SUPER_ADMIN'],
    },
  ];

  const filteredItems = navigationItems.filter(item => 
    item.allowedRoles.includes(session?.user?.role || '')
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex space-x-8 overflow-x-auto py-4">
          {filteredItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                isActive(item.path)
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-brand-primary hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
              {!isSuperAdmin && item.allowedRoles.includes('SUPER_ADMIN') && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  SuperAdmin
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}