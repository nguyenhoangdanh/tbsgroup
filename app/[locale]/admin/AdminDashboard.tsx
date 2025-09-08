'use client';

import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { AdminInquiryTable } from '@/components/AdminInquiryTable';
import { AdminNavigation } from '@/components/AdminNavigation';
import { MotionFadeIn } from '@/components/MotionFadeIn';

interface AdminDashboardProps {
  locale: string;
}

export function AdminDashboard({ locale }: AdminDashboardProps) {
  const t = useTranslations('admin.dashboard');
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: `/${locale}` });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 lg:pt-24">
      {/* Navigation */}
      <AdminNavigation locale={locale} />
      
      <div className="max-w-7xl mx-auto container-padding">
        <MotionFadeIn>
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl lg:text-3xl font-bold text-brand-primary">
                  {t('title')}
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {session?.user?.email}
                  {session?.user?.role === 'SUPER_ADMIN' && (
                    <span className="ml-2 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm font-medium">
                      SuperAdmin
                    </span>
                  )}
                </p>
              </div>
              
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                {t('logout')}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Customer Inquiries
            </h2>
            <AdminInquiryTable locale={locale} />
          </div>
        </MotionFadeIn>
      </div>
    </div>
  );
}