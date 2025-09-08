"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { debounce } from '@/lib/utils';
import { getTranslatedContent, MultilingualContent } from '@/lib/utils/multilingual';
import { CategoriesManagerProps } from '@/types/admin';
import { TableColumn } from '@/types/ui';
import AdminLayout from '@/components/layout/AdminLayout';
import CategoryForm from './CategoryForm';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SearchBox from '@/components/ui/SearchBoxFixed';
import { EmptyTableState } from '@/components/ui/EmptyState';

interface Category {
  id: string;
  name: MultilingualContent;
  slug: string;
  description?: MultilingualContent;
  thumbnail?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
}

const CategoriesManager: React.FC<CategoriesManagerProps> = ({ locale }) => {
  const { data: session } = useSession();
  const router = useRouter();

  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    draft: 0
  });

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

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
      });
      
      const response = await fetch(`/api/admin/categories?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
      setTotal(data.meta?.total || 0);
      
      // Calculate stats
      const active = data.data?.filter((cat: Category) => cat.status === 'ACTIVE').length || 0;
      const inactive = data.data?.filter((cat: Category) => cat.status === 'INACTIVE').length || 0;
      const draft = data.data?.filter((cat: Category) => cat.status === 'DRAFT').length || 0;
      
      setStats({
        total: data.meta?.total || 0,
        active,
        inactive,
        draft
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, pageSize, search]);

  // Handlers
  const handleCreate = async (data: any) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create category');
      }

      await fetchCategories();
      setShowCreateModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      throw err;
    }
  };

  const handleEdit = async (data: any) => {
    if (!editingCategory) return;

    try {
      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update category');
      }

      await fetchCategories();
      setEditingCategory(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw err;
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
        throw new Error(errorData.error?.message || 'Failed to delete category');
      }

      fetchCategories();
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedRows.length} categories?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedRows.map(id => 
          fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
        )
      );
      
      fetchCategories();
      setSelectedRows([]);
    } catch (err) {
      setError('Failed to delete some categories');
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  // Table configuration
  const columns: TableColumn<Category>[] = [
    {
      key: 'thumbnail',
      label: 'Image',
      align: 'center',
      width: 80,
      render: (value, item) => (
        <div className="flex justify-center">
          {value ? (
            <img
              src={value}
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
      label: 'Name',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="font-medium text-slate-900">
            {getTranslatedContent(value, locale as 'vi' | 'en' | 'id')}
          </div>
          <div className="text-sm text-slate-500">
            /{item.slug}
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => (
        <div className="max-w-xs">
          {value ? (
            <span className="text-slate-600 text-sm line-clamp-2">
              {getTranslatedContent(value, locale as 'vi' | 'en' | 'id')}
            </span>
          ) : (
            <span className="text-slate-400 text-sm">No description</span>
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
      key: '_count',
      label: 'Products',
      align: 'center',
      render: (value) => (
        <span className="text-slate-600">
          {value?.products || 0}
        </span>
      )
    },
    {
      key: 'sortOrder',
      label: 'Order',
      align: 'center',
      sortable: true,
      width: 80,
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
      onClick: (item: Category) => setEditingCategory(item),
      variant: 'ghost' as const,
    },
    {
      label: 'Delete',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: (item: Category) => handleDelete(item.id),
      variant: 'ghost' as const,
      disabled: (item: Category) => item._count.products > 0,
    }
  ];

  // Check user permission
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: `/${locale}/admin` },
    { label: 'Categories', current: true }
  ];

  return (
    <AdminLayout
      title="Categories"
      breadcrumbs={breadcrumbs}
      user={session.user as any}
      actions={
        <div className="flex items-center space-x-3">
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
            variant="outline"
            onClick={() => setShowCreateModal(true)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            New Category
          </Button>
        </div>
      }
    >
      <div className="section-spacing">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Categories</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Inactive</p>
                <p className="text-2xl font-bold text-slate-600">{stats.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Draft</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card padding="md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-md">
              <SearchBox
                value={search}
                onChange={debouncedSearch}
                placeholder="Search categories..."
                className="w-full"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                disabled={!search}
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>

        {/* Categories Table */}
        <Card>
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Table
            data={categories}
            columns={columns}
            actions={actions}
            isLoading={loading}
            selectedRows={selectedRows}
            onRowSelect={setSelectedRows}
            pagination={{
              page,
              pageSize,
              total,
              totalPages,
              hasNext: page < totalPages,
              hasPrev: page > 1
            }}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            emptyState={
              <EmptyTableState
                title="No categories found"
                description="Get started by creating your first category."
                onCreateNew={() => setShowCreateModal(true)}
                createLabel="Create Category"
              />
            }
          />
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <CategoryForm
        isOpen={showCreateModal || !!editingCategory}
        onClose={() => {
          setShowCreateModal(false);
          setEditingCategory(null);
          setError('');
        }}
        category={editingCategory}
        onSubmit={editingCategory ? handleEdit : handleCreate}
        locale={locale}
      />
    </AdminLayout>
  );
};

export default CategoriesManager;
