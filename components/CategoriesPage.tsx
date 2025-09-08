'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AdminNavigation } from '@/components/AdminNavigation';
import { MotionFadeIn } from '@/components/MotionFadeIn';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    products: number;
  };
}

interface CategoriesPageProps {
  locale: string;
}

export function CategoriesPage({ locale }: CategoriesPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('admin.categories');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Check if user is SuperAdmin
  useEffect(() => {
    if (session && session.user.role !== 'SUPER_ADMIN') {
      router.push(`/${locale}/admin`);
      return;
    }
  }, [session, router, locale]);

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
      });
      
      const response = await fetch(`/api/admin/categories?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (session?.user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 lg:pt-24">
      <AdminNavigation locale={locale} />
      
      <div className="max-w-7xl mx-auto container-padding">
        <MotionFadeIn>
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-serif text-2xl lg:text-3xl font-bold text-brand-primary">
                  {t('title')}
                </h1>
                <p className="text-gray-600 mt-1">
                  {t('description')}
                </p>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                {t('create')}
              </button>
            </div>

            {/* Search */}
            <div className="mt-6">
              <input
                type="text"
                placeholder={t('search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input max-w-md"
              />
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Categories Grid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                <p className="text-gray-500 mt-2">{t('loading')}</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('noCategories')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {category.imageUrl && (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                    )}
                    
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 mb-2">
                      Slug: {category.slug}
                    </p>
                    
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                      
                      <span className="text-sm text-gray-500">
                        {category._count.products} products
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="flex-1 text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={category._count.products > 0}
                        className={`flex-1 text-sm px-3 py-2 rounded-md transition-colors ${
                          category._count.products > 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </MotionFadeIn>
      </div>

      {/* Create/Edit Modal would go here */}
    </div>
  );
}