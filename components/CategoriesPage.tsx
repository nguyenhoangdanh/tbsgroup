'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AdminLayout from '@/components/layout/AdminLayout';
import { MotionFadeIn } from '@/components/MotionFadeIn';
import { motion } from 'framer-motion';
import { getTranslatedContent, MultilingualContent } from '@/lib/utils/multilingual';
import CreateCategoryModal from '@/components/admin/forms/CreateCategoryModal';
import EditCategoryModal from '@/components/admin/forms/EditCategoryModal';
import DeleteCategoryDialog from '@/components/admin/forms/DeleteCategoryDialog';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Category {
  id: string;
  name: MultilingualContent;
  slug: string;
  description?: MultilingualContent;
  thumbnail?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  sortOrder: number;
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
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

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

  const handleCreateSuccess = () => {
    fetchCategories();
    setShowCreateModal(false);
  };

  const handleEditSuccess = () => {
    fetchCategories();
    setEditingCategory(null);
  };

  const handleDeleteSuccess = () => {
    fetchCategories();
    setDeletingCategory(null);
  };

  if (session?.user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <AdminLayout
      title="Categories"
      user={session.user as any}
      actions={
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Create Category
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Category Management
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Manage product categories with multi-language support
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-md">
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={setSearch}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Categories Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="spinner w-8 h-8 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-slate-500 text-lg mb-2">No categories found</p>
              <p className="text-slate-400 text-sm mb-4">Get started by creating your first category</p>
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create Category
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card hover:shadow-md transition-shadow"
                  >
                    {category.thumbnail && (
                      <div className="aspect-w-16 aspect-h-9 mb-4">
                        <img
                          src={category.thumbnail}
                          alt={getTranslatedContent(category.name, locale as 'vi' | 'en' | 'id')}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-slate-900 mb-2">
                        {getTranslatedContent(category.name, locale as 'vi' | 'en' | 'id')}
                      </h3>
                      
                      <p className="text-sm text-slate-500 mb-2">
                        <span className="font-medium">Slug:</span> {category.slug}
                      </p>
                      
                      {category.description && (
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {getTranslatedContent(category.description, locale as 'vi' | 'en' | 'id')}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className={`badge-base ${
                          category.status === 'ACTIVE'
                            ? 'badge-success' 
                            : category.status === 'INACTIVE'
                            ? 'badge-neutral'
                            : 'badge-warning'
                        }`}>
                          {category.status}
                        </span>
                        
                        <span className="text-sm text-slate-500">
                          {category._count.products} product{category._count.products !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCategory(category)}
                          className="flex-1"
                          icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          }
                        >
                          Edit
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingCategory(category)}
                          disabled={category._count.products > 0}
                          className={`flex-1 ${
                            category._count.products > 0
                              ? 'opacity-50 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-50 hover:border-red-200'
                          }`}
                          icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8 pt-6 border-t border-slate-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    }
                  >
                    Previous
                  </Button>
                  
                  <span className="px-4 py-2 text-sm text-slate-700">
                    Page {page} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    }
                    iconPosition="right"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditCategoryModal
        category={editingCategory}
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onSuccess={handleEditSuccess}
      />

      <DeleteCategoryDialog
        category={deletingCategory}
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onSuccess={handleDeleteSuccess}
      />
    </AdminLayout>
  );
}