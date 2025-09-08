'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AdminNavigation } from '@/components/AdminNavigation';
import { MotionFadeIn } from '@/components/MotionFadeIn';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price?: number;
  imageUrls: string[];
  isActive: boolean;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ProductsPageProps {
  locale: string;
}

export function ProductsPage({ locale }: ProductsPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('admin.products');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Check if user is SuperAdmin
  useEffect(() => {
    if (session && session.user.role !== 'SUPER_ADMIN') {
      router.push(`/${locale}/admin`);
      return;
    }
  }, [session, router, locale]);

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
      });
      
      const response = await fetch(`/api/admin/products?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      fetchProducts();
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
                onClick={() => alert('Create product modal would open here')}
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

          {/* Products Grid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                <p className="text-gray-500 mt-2">{t('loading')}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('noProducts')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {product.imageUrls.length > 0 && (
                      <img
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                    )}
                    
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 mb-2">
                      Category: {product.category.name}
                    </p>
                    
                    {product.price && (
                      <p className="text-lg font-semibold text-brand-primary mb-2">
                        {new Intl.NumberFormat('vi-VN', { 
                          style: 'currency', 
                          currency: 'VND' 
                        }).format(product.price)}
                      </p>
                    )}
                    
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                      
                      <span className="text-sm text-gray-500">
                        {product.imageUrls.length} images
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => alert('Edit product modal would open here')}
                        className="flex-1 text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md hover:bg-red-100 transition-colors"
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
    </div>
  );
}