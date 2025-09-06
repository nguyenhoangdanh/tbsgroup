'use client';

import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { AdminInquiryTable } from '@/components/AdminInquiryTable';
import { MotionFadeIn } from '@/components/MotionFadeIn';

interface AdminDashboardProps {
  locale: string;
}

export function AdminDashboard({ locale }: AdminDashboardProps) {
  const t = useTranslations('admin.dashboard');

  const handleLogout = () => {
    signOut({ callbackUrl: `/${locale}` });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 lg:pt-24">
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
                  Manage customer consultation requests
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
            <AdminInquiryTable locale={locale} />
          </div>
        </MotionFadeIn>
      </div>
    </div>
  );
}