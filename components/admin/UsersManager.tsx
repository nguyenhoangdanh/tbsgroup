'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { debounce } from '@/lib/utils';
import { TableColumn } from '@/types/ui';
import AdminLayout from '@/components/layout/AdminLayout';
import UserForm from './UserForm';
import {
  Card,
  Table,
  Button,
  Badge,
  Loading,
  EmptyTableState,
  SearchBox
} from '@/components/ui';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersManagerProps {
  locale: string;
}

const UsersManager: React.FC<UsersManagerProps> = ({ locale }) => {
  const { data: session } = useSession();
  const router = useRouter();

  // State management
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    superAdmins: 0,
    admins: 0
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

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
      });
      
      const response = await fetch(`/api/admin/users?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
      setTotal(data.meta?.total || 0);
      
      // Calculate stats
      const active = data.data?.filter((user: AdminUser) => user.isActive).length || 0;
      const inactive = data.data?.filter((user: AdminUser) => !user.isActive).length || 0;
      const superAdmins = data.data?.filter((user: AdminUser) => user.role === 'SUPER_ADMIN').length || 0;
      const admins = data.data?.filter((user: AdminUser) => user.role === 'ADMIN').length || 0;
      
      setStats({
        total: data.meta?.total || 0,
        active,
        inactive,
        superAdmins,
        admins
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, search]);

  // Handlers
  const handleCreate = async (data: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create user');
      }

      await fetchUsers();
      setShowCreateModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    }
  };

  const handleEdit = async (data: any) => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update user');
      }

      await fetchUsers();
      setEditingUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.id === session?.user?.id) {
      setError('You cannot delete your own account');
      return;
    }

    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete user');
      }

      fetchUsers();
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    if (id === session?.user?.id) {
      setError('You cannot deactivate your own account');
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  // Table configuration
  const columns: TableColumn<AdminUser>[] = [
    {
      key: 'firstName',
      label: 'Name',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-slate-600 font-medium text-sm">
              {item.firstName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-slate-900">
              {item.firstName} {item.lastName}
            </div>
            <div className="text-sm text-slate-500">{item.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      align: 'center',
      render: (value) => (
        <Badge
          variant={value === 'SUPER_ADMIN' ? 'warning' : 'info'}
        >
          {value === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
        </Badge>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      align: 'center',
      render: (value, item) => (
        <button
          onClick={() => handleStatusToggle(item.id, value)}
          className="focus:outline-none"
          disabled={item.id === session?.user?.id}
        >
          <Badge 
            variant={value ? 'success' : 'neutral'}
          >
            {value ? 'Active' : 'Inactive'}
          </Badge>
        </button>
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
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
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
      onClick: (item: AdminUser) => setEditingUser(item),
      variant: 'ghost' as const,
    },
    {
      label: 'Delete',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: (item: AdminUser) => handleDelete(item.id),
      variant: 'ghost' as const,
      disabled: (item: AdminUser) => item.id === session?.user?.id,
    }
  ];

  // Check user permission
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: `/${locale}/admin` },
    { label: 'Users', current: true }
  ];

  return (
    <AdminLayout
      title="Users"
      breadcrumbs={breadcrumbs}
      user={session.user as any}
      actions={
        <div className="flex items-center space-x-3">
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            New User
          </Button>
        </div>
      }
    >
      <div className="section-spacing">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total Users</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center text-white">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Active</p>
                <p className="text-2xl font-bold text-success">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-success-light rounded-lg flex items-center justify-center text-success">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Inactive</p>
                <p className="text-2xl font-bold text-neutral-700">{stats.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-700">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Super Admins</p>
                <p className="text-2xl font-bold text-accent">{stats.superAdmins}</p>
              </div>
              <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center text-accent">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Admins</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.admins}</p>
              </div>
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center text-white">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                placeholder="Search users..."
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

        {/* Users Table */}
        <Card padding="md">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Table
            data={users}
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
                title="No users found"
                description="Get started by creating your first admin user."
                onCreateNew={() => setShowCreateModal(true)}
                createLabel="Create User"
              />
            }
          />
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <UserForm
        isOpen={showCreateModal || !!editingUser}
        onClose={() => {
          setShowCreateModal(false);
          setEditingUser(null);
          setError('');
        }}
        user={editingUser}
        onSubmit={editingUser ? handleEdit : handleCreate}
        currentUser={session.user as any}
      />
    </AdminLayout>
  );
};

export default UsersManager;
