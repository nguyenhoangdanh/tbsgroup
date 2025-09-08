"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProductForm from './ProductForm';

interface ProductsManagerProps {
  locale: string;
}
import { getTranslatedContent, MultilingualContent } from '@/lib/utils/multilingual';
import { debounce, formatPrice } from '@/lib/utils';
import AdminLayout from '../layout/AdminLayout';
import Table from '../ui/Table';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import { EmptyTableState } from '../ui/EmptyState';
import { TableColumn } from '@/types/ui';

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
  updatedAt: string;
  categoryId: string;
  category: {
    id: string;
    name: MultilingualContent;
    slug: string;
  };
}

const ProductsManager: React.FC<ProductsManagerProps> = ({ locale }) => {
  const { data: session } = useSession();
  const router = useRouter();

  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Check if user is SuperAdmin
  useEffect(() => {
    if (session && session.user.role !== 'SUPER_ADMIN') {
      router.push(`/${locale}/admin`);
      return;
    }
  }, [session, router, locale]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearch(value);
      setPage(1);
    }, 300),
    []
  );

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
      });
      
      const response = await fetch(`/api/admin/products?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, pageSize, search]);

  // Handlers
  // Handlers
  const handleCreate = async (data: any) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create product');
      }

      await fetchProducts();
      setShowCreateModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    }
  };

  const handleEdit = async (data: any) => {
    if (!editingProduct) return;

    try {
      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update product');
      }

      await fetchProducts();
      setEditingProduct(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
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
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedRows.length} products?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedRows.map(id => 
          fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
        )
      );
      
      fetchProducts();
      setSelectedRows([]);
    } catch (err) {
      setError('Failed to delete some products');
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleFeaturedToggle = async (id: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !currentFeatured }),
      });

      if (!response.ok) {
        throw new Error('Failed to update featured status');
      }

      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update featured status');
    }
  };

  // Table configuration
  const columns: TableColumn<Product>[] = [
    {
      key: 'images',
      label: 'Image',
      align: 'center',
      width: 80,
      render: (value, item) => (
        <div className="flex justify-center">
          {value && value.length > 0 ? (
            <img
              src={value[0]}
              alt={getTranslatedContent(item.name, locale as 'vi' | 'en' | 'id')}
              className="w-10 h-10 object-cover rounded-lg"
            />
          ) : (
            <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="font-medium text-slate-900">
            {getTranslatedContent(value, locale as 'vi' | 'en' | 'id')}
          </div>
          <div className="text-sm text-slate-500">
            {getTranslatedContent(item.category.name, locale as 'vi' | 'en' | 'id')}
          </div>
          <div className="text-xs text-slate-400">
            /{item.slug}
          </div>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      sortable: true,
      render: (value, item) => (
        <div className="text-right">
          {value ? (
            <div>
              <div className="font-medium text-slate-900">
                {formatPrice(value, locale)}
              </div>
              {item.originalPrice && item.originalPrice > value && (
                <div className="text-sm text-slate-500 line-through">
                  {formatPrice(item.originalPrice, locale)}
                </div>
              )}
            </div>
          ) : (
            <span className="text-slate-400">Contact</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (value, item) => (
        <button
          onClick={() => handleStatusToggle(item.id, value)}
          className="focus:outline-none"
        >
          <Badge 
            variant={value === 'ACTIVE' ? 'success' : value === 'INACTIVE' ? 'neutral' : 'warning'}
          >
            {value}
          </Badge>
        </button>
      )
    },
    {
      key: 'featured',
      label: 'Featured',
      align: 'center',
      render: (value, item) => (
        <button
          onClick={() => handleFeaturedToggle(item.id, value)}
          className="focus:outline-none"
        >
          {value ? (
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )}
        </button>
      )
    },
    {
      key: 'images',
      label: 'Images',
      align: 'center',
      render: (value) => (
        <span className="text-slate-600">
          {value?.length || 0}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => (
        <span className="text-slate-600 text-sm">
          {new Date(value).toLocaleDateString(locale)}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'Edit',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: (item: Product) => setEditingProduct(item),
      variant: 'ghost' as const,
    },
    {
      label: 'Delete',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: (item: Product) => handleDelete(item.id),
      variant: 'ghost' as const,
    }
  ];

  // Check user permission
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: `/${locale}/admin` },
    { label: 'Products', current: true }
  ];

  return (
    <AdminLayout
      title="Products"
      breadcrumbs={breadcrumbs}
      user={session.user as any}
      actions={
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-neutral-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
            />
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              }
            />
          </div>

          {selectedRows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
            >
              Delete ({selectedRows.length})
            </Button>
          )}
          
          <Button
            variant="accent"
            onClick={() => setShowCreateModal(true)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            New Product
          </Button>
        </div>
      }
    >
      <div className="section-spacing">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Products</p>
                <p className="text-2xl font-bold text-slate-900">{total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active</p>
                <p className="text-2xl font-bold text-slate-900">
                  {products.filter(p => p.status === 'ACTIVE').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Featured</p>
                <p className="text-2xl font-bold text-slate-900">
                  {products.filter(p => p.featured).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Draft</p>
                <p className="text-2xl font-bold text-slate-900">
                  {products.filter(p => p.status === 'DRAFT').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card padding="md">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Search products..."
              value=""
              onChange={debouncedSearch}
              className="max-w-md"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Data Table */}
        <Card>
          <Table
            data={products}
            columns={columns}
            isLoading={loading}
            pagination={{
              page,
              pageSize,
              total,
              totalPages,
              hasNext: page < totalPages,
              hasPrev: page > 1,
            }}
            selectedRows={selectedRows}
            onRowSelect={setSelectedRows}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            actions={actions}
            emptyState={
              <EmptyTableState
                title="No products found"
                description="Get started by creating your first product."
                onCreateNew={() => setShowCreateModal(true)}
                createLabel="Create Product"
              />
            }
          />
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <ProductForm
        isOpen={showCreateModal || !!editingProduct}
        onClose={() => {
          setShowCreateModal(false);
          setEditingProduct(null);
          setError('');
        }}
        product={editingProduct}
        onSubmit={editingProduct ? handleEdit : handleCreate}
        locale={locale}
      />
    </AdminLayout>
  );
};

export default ProductsManager;
