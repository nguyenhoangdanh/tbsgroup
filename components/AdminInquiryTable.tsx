'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Inquiry {
  id: string;
  email: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
}

interface AdminInquiryTableProps {
  locale: string;
}

export function AdminInquiryTable({ locale }: AdminInquiryTableProps) {
  const t = useTranslations('admin.dashboard');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInquiries();
  }, [page]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/inquiries?page=${page}&pageSize=20`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch inquiries');
      }

      const data = await response.json();
      setInquiries(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {t('noData')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.email')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.content')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.images')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.createdAt')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inquiries.map((inquiry) => (
              <motion.tr
                key={inquiry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {inquiry.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs">
                    {truncateText(inquiry.content)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {inquiry.imageUrls.length > 0 ? (
                    <div className="flex space-x-1">
                      {inquiry.imageUrls.slice(0, 3).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Image ${index + 1}`}
                          className="w-8 h-8 object-cover rounded border"
                        />
                      ))}
                      {inquiry.imageUrls.length > 3 && (
                        <div className="w-8 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                          +{inquiry.imageUrls.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(new Date(inquiry.createdAt), locale)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {inquiries.map((inquiry) => (
          <motion.div
            key={inquiry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.email')}
                </label>
                <div className="text-sm text-gray-900">{inquiry.email}</div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.content')}
                </label>
                <div className="text-sm text-gray-900">{truncateText(inquiry.content, 150)}</div>
              </div>
              
              {inquiry.imageUrls.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('table.images')}
                  </label>
                  <div className="flex space-x-1 mt-1">
                    {inquiry.imageUrls.slice(0, 4).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    ))}
                    {inquiry.imageUrls.length > 4 && (
                      <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                        +{inquiry.imageUrls.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.createdAt')}
                </label>
                <div className="text-sm text-gray-500">{formatDate(new Date(inquiry.createdAt), locale)}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}