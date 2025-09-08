'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { debounce, getLocalizedContent } from '@/lib/utils';
import { MultilingualContent } from '@/lib/utils/multilingual';
import { TableColumn } from '@/types/ui';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Card,
  Table,
  Button,
  Badge,
  Loading,
  EmptyTableState,
  SearchBox,
  Modal
} from '@/components/ui';

interface CustomerInquiry {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  productId?: string;
  product?: {
    id: string;
    name: MultilingualContent;
    slug: string;
  };
}

interface InquiriesViewerProps {
  locale: string;
}

const InquiriesViewer: React.FC<InquiriesViewerProps> = ({ locale }) => {
  const { data: session } = useSession();

  // State management
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [viewingInquiry, setViewingInquiry] = useState<CustomerInquiry | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearch(value);
      setPage(1);
    }, 300),
    []
  );

  // Fetch inquiries
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });
      
      const response = await fetch(`/api/admin/inquiries?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch inquiries');
      }

      const data = await response.json();
      setInquiries(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
      setTotal(data.meta?.total || 0);
      
      // Calculate stats
      const newInq = data.data?.filter((inq: CustomerInquiry) => inq.status === 'NEW').length || 0;
      const inProgress = data.data?.filter((inq: CustomerInquiry) => inq.status === 'IN_PROGRESS').length || 0;
      const resolved = data.data?.filter((inq: CustomerInquiry) => inq.status === 'RESOLVED').length || 0;
      const closed = data.data?.filter((inq: CustomerInquiry) => inq.status === 'CLOSED').length || 0;
      
      setStats({
        total: data.meta?.total || 0,
        new: newInq,
        inProgress,
        resolved,
        closed
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [page, pageSize, search, statusFilter]);

  // Handle status update (only for SUPER_ADMIN)
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (session?.user?.role !== 'SUPER_ADMIN') {
      setError('You do not have permission to update inquiry status');
      return;
    }

    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update inquiry status');
      }

      fetchInquiries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedRows.length === 0) return;
    if (session?.user?.role !== 'SUPER_ADMIN') {
      setError('You do not have permission to update inquiry status');
      return;
    }

    if (!confirm(`Are you sure you want to mark ${selectedRows.length} inquiries as ${newStatus}?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedRows.map(id => 
          fetch(`/api/admin/inquiries/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );
      
      fetchInquiries();
      setSelectedRows([]);
    } catch (err) {
      setError('Failed to update some inquiries');
    }
  };

  // Handle delete (only for SUPER_ADMIN)
  const handleDelete = async (id: string) => {
    if (session?.user?.role !== 'SUPER_ADMIN') {
      setError('You do not have permission to delete inquiries');
      return;
    }

    if (!confirm('Are you sure you want to delete this inquiry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete inquiry');
      }

      fetchInquiries();
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Table configuration
  const columns: TableColumn<CustomerInquiry>[] = [
    {
      key: 'fullName',
      label: 'Customer',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="font-medium text-slate-900">{value}</div>
          <div className="text-sm text-slate-500">{item.email}</div>
          {item.phone && (
            <div className="text-sm text-slate-500">{item.phone}</div>
          )}
        </div>
      )
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (value, item) => (
        <div>
          <div className="font-medium text-slate-900 line-clamp-1">{value}</div>
          {item.product && (
            <div className="text-sm text-slate-500">
              Product: {getLocalizedContent(item.product.name, locale as 'vi' | 'en' | 'id')}
            </div>
          )}
          {item.company && (
            <div className="text-sm text-slate-500">Company: {item.company}</div>
          )}
        </div>
      )
    },
    {
      key: 'message',
      label: 'Message',
      render: (value) => (
        <div className="max-w-xs">
          <span className="text-slate-600 text-sm line-clamp-2">
            {value}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (value, item) => {
        const canUpdate = session?.user?.role === 'SUPER_ADMIN';
        const statusOptions = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
        
        if (canUpdate) {
          return (
            <select
              value={value}
              onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
              className="text-sm rounded px-2 py-1 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          );
        }

        return (
          <Badge 
            variant={
              value === 'NEW' ? 'info' :
              value === 'IN_PROGRESS' ? 'warning' :
              value === 'RESOLVED' ? 'success' : 'neutral'
            }
          >
            {value.replace('_', ' ')}
          </Badge>
        );
      }
    },
    {
      key: 'createdAt',
      label: 'Received',
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
      label: 'View Details',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      onClick: (item: CustomerInquiry) => setViewingInquiry(item),
      variant: 'ghost' as const,
    },
    ...(session?.user?.role === 'SUPER_ADMIN' ? [{
      label: 'Delete',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: (item: CustomerInquiry) => handleDelete(item.id),
      variant: 'ghost' as const,
    }] : [])
  ];

  const breadcrumbs = [
    { label: 'Dashboard', href: `/${locale}/admin` },
    { label: 'Customer Inquiries', current: true }
  ];

  return (
    <AdminLayout
      title="Customer Inquiries"
      breadcrumbs={breadcrumbs}
      user={session?.user as any}
      actions={
        selectedRows.length > 0 && session?.user?.role === 'SUPER_ADMIN' ? (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusUpdate('RESOLVED')}
            >
              Mark as Resolved ({selectedRows.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusUpdate('CLOSED')}
            >
              Mark as Closed ({selectedRows.length})
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="section-spacing">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">New</p>
                <p className="text-2xl font-bold text-accent">{stats.new}</p>
              </div>
              <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">In Progress</p>
                <p className="text-2xl font-bold text-warning">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-warning-light rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Resolved</p>
                <p className="text-2xl font-bold text-success">{stats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-success-light rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Closed</p>
                <p className="text-2xl font-bold text-slate-600">{stats.closed}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                placeholder="Search inquiries..."
                className="w-full"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input text-sm py-2 px-3 w-auto min-w-0"
              >
                <option value="all">All Status</option>
                <option value="NEW">New</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setPage(1);
                }}
                disabled={!search && statusFilter === 'all'}
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>

        {/* Inquiries Table */}
        <Card>
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <p className="text-sm text-accent">{error}</p>
            </div>
          )}

          <Table
            data={inquiries}
            columns={columns}
            actions={actions}
            isLoading={loading}
            selectedRows={selectedRows}
            onRowSelect={session?.user?.role === 'SUPER_ADMIN' ? setSelectedRows : undefined}
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
                title="No inquiries found"
                description="Customer inquiries will appear here when they contact you."
              />
            }
          />
        </Card>
      </div>

      {/* Inquiry Details Modal */}
      <Modal
        isOpen={!!viewingInquiry}
        onClose={() => setViewingInquiry(null)}
        title="Inquiry Details"
        size="lg"
      >
        {viewingInquiry && (
          <div className="section-spacing">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-2">Customer Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {viewingInquiry.fullName}</div>
                  <div><strong>Email:</strong> {viewingInquiry.email}</div>
                  {viewingInquiry.phone && (
                    <div><strong>Phone:</strong> {viewingInquiry.phone}</div>
                  )}
                  {viewingInquiry.company && (
                    <div><strong>Company:</strong> {viewingInquiry.company}</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-2">Inquiry Details</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Status:</strong> 
                    <Badge 
                      variant={
                        viewingInquiry.status === 'NEW' ? 'info' :
                        viewingInquiry.status === 'IN_PROGRESS' ? 'warning' :
                        viewingInquiry.status === 'RESOLVED' ? 'success' : 'neutral'
                      }
                      className="ml-2"
                    >
                      {viewingInquiry.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div><strong>Received:</strong> {new Date(viewingInquiry.createdAt).toLocaleString(locale)}</div>
                  {viewingInquiry.product && (
                    <div><strong>Product:</strong> {getLocalizedContent(viewingInquiry.product.name, locale as 'vi' | 'en' | 'id')}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-2">Subject</h4>
              <p className="text-slate-700">{viewingInquiry.subject}</p>
            </div>

            {/* Message */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-2">Message</h4>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700 whitespace-pre-wrap">{viewingInquiry.message}</p>
              </div>
            </div>

            {/* Actions */}
            {session?.user?.role === 'SUPER_ADMIN' && (
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => setViewingInquiry(null)}
                >
                  Close
                </Button>
                <Button
                  variant="accent"
                  onClick={() => {
                    window.location.href = `mailto:${viewingInquiry.email}?subject=Re: ${viewingInquiry.subject}`;
                  }}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                >
                  Reply via Email
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default InquiriesViewer;
