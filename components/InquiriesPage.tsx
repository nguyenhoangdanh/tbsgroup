'use client';

import { AdminNavigation } from '@/components/AdminNavigation';
import { AdminInquiryTable } from '@/components/AdminInquiryTable';
import { MotionFadeIn } from '@/components/MotionFadeIn';
import { useTranslations } from 'next-intl';

interface InquiriesPageProps {
  locale: string;
}

export function InquiriesPage({ locale }: InquiriesPageProps) {
  const t = useTranslations('admin.inquiries');

  return (
    <div className="min-h-screen bg-gray-50 pt-20 lg:pt-24">
      <AdminNavigation locale={locale} />
      
      <div className="max-w-7xl mx-auto container-padding">
        <MotionFadeIn>
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div>
              <h1 className="font-serif text-2xl lg:text-3xl font-bold text-brand-primary">
                {t('title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('description')}
              </p>
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