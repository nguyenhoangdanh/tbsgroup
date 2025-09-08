'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AdminLayout from '@/components/layout/AdminLayout';
import { MotionFadeIn } from '@/components/MotionFadeIn';
import { motion } from 'framer-motion';
import { getTranslatedContent, MultilingualContent } from '@/lib/utils/multilingual';
import { formatPrice } from '@/lib/utils';
import CreateProductModal from '@/components/admin/forms/CreateProductModal';
import DeleteProductDialog from '@/components/admin/forms/DeleteProductDialog';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Product {
  id: string;
  name: MultilingualContent;
  slug: string;
  description?: MultilingualContent;
  shortDesc?: MultilingualContent;
  price?: number;
  originalPrice?: number;
  images: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  category: {
    id: string;
    name: MultilingualContent;
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
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Check if user is SuperAdmin
  useEffect(() => {
    if (session && session.user.role !== 'SUPER_ADMIN') {
      router.push(`/${locale}/admin`);
      return;
    }
  }, [session, router, locale]);

  useEffect(() => {
    fetchProducts();
  }, [page, search, statusFilter, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { categoryId: categoryFilter }),
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

  const handleCreateSuccess = () => {
    fetchProducts();
    setShowCreateModal(false);
  };

  const handleDeleteSuccess = () => {
    fetchProducts();
    setDeletingProduct(null);
  };

  const toggleFeatured = async (product: Product) => {
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !product.featured }),
      });

      if (!response.ok) {
        throw new Error('Failed to update featured status');
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
    <AdminLayout
      title="Products"
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
          Create Product
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Product Management
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Manage products with multi-language support and image galleries
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={setSearch}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
            
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
            
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                {/* Categories would be loaded here */}
              </select>
            </div>
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

        {/* Products Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="spinner w-8 h-8 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-slate-500 text-lg mb-2">No products found</p>
              <p className="text-slate-400 text-sm mb-4">Get started by creating your first product</p>
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create Product
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card hover:shadow-md transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="aspect-w-16 aspect-h-12 mb-4">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={getTranslatedContent(product.name, locale as 'vi' | 'en' | 'id')}
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-product.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                          <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Featured Badge */}
                      {product.featured && (
                        <div className="absolute top-2 left-2">
                          <span className="badge-base bg-amber-500 text-white">
                            ⭐ Featured
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-slate-900 mb-2 line-clamp-2">
                        {getTranslatedContent(product.name, locale as 'vi' | 'en' | 'id')}
                      </h3>
                      
                      <p className="text-sm text-slate-500 mb-2">
                        <span className="font-medium">Category:</span> {getTranslatedContent(product.category.name, locale as 'vi' | 'en' | 'id')}
                      </p>
                      
                      <p className="text-sm text-slate-500 mb-2">
                        <span className="font-medium">Slug:</span> {product.slug}
                      </p>
                      
                      {product.price && (
                        <div className="mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-semibold text-slate-900">
                              {formatPrice(product.price, locale)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-slate-500 line-through">
                                {formatPrice(product.originalPrice, locale)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {product.shortDesc && (
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {getTranslatedContent(product.shortDesc, locale as 'vi' | 'en' | 'id')}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className={`badge-base ${
                          product.status === 'ACTIVE'
                            ? 'badge-success' 
                            : product.status === 'INACTIVE'
                            ? 'badge-neutral'
                            : 'badge-warning'
                        }`}>
                          {product.status}
                        </span>
                        
                        <span className="text-sm text-slate-500">
                          {product.images.length} image{product.images.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleFeatured(product)}
                          className={`${
                            product.featured
                              ? 'text-amber-600 border-amber-200 bg-amber-50'
                              : 'text-slate-600'
                          }`}
                          icon={
                            <svg className="w-4 h-4" fill={product.featured ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          }
                        >
                          {product.featured ? 'Featured' : 'Feature'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => alert('Edit functionality coming soon')}
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
                          onClick={() => setDeletingProduct(product)}
                          className="text-red-600 hover:bg-red-50 hover:border-red-200"
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
      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <DeleteProductDialog
        product={deletingProduct}
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onSuccess={handleDeleteSuccess}
      />
    </AdminLayout>
  );
}