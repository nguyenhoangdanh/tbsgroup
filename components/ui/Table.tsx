import React from 'react';
import { cn } from '@/lib/utils';
import Button from './Button';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: number;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface TableAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'accent';
  disabled?: (item: T) => boolean;
}

export interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  isLoading?: boolean;
  selectedRows?: string[];
  onRowSelect?: (selectedIds: string[]) => void;
  pagination?: TablePaginationProps;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  emptyState?: React.ReactNode;
  className?: string;
}

const Table = <T extends { id: string }>({
  data,
  columns,
  actions = [],
  isLoading = false,
  selectedRows = [],
  onRowSelect,
  pagination,
  onPageChange,
  onPageSizeChange,
  emptyState,
  className
}: TableProps<T>) => {
  const handleSelectAll = (checked: boolean) => {
    if (!onRowSelect) return;
    
    if (checked) {
      const allIds = data.map(item => item.id);
      onRowSelect(allIds);
    } else {
      onRowSelect([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onRowSelect) return;
    
    if (checked) {
      onRowSelect([...selectedRows, id]);
    } else {
      onRowSelect(selectedRows.filter(rowId => rowId !== id));
    }
  };

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <div className="p-8">{emptyState}</div>;
  }

  return (
    <div className={cn('bg-white rounded-lg overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {onRowSelect && (
                <th className="w-12 px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.label}
                </th>
              ))}
              
              {actions.length > 0 && (
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-slate-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                {onRowSelect && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                
                {columns.map((column) => {
                  const value = (item as any)[column.key];
                  const displayValue = column.render ? column.render(value, item) : value;
                  
                  return (
                    <td
                      key={column.key}
                      className={cn(
                        'px-6 py-4 whitespace-nowrap text-sm',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {displayValue}
                    </td>
                  );
                })}
                
                {actions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {actions.map((action, index) => (
                        <Button
                          key={index}
                          variant={action.variant || 'ghost'}
                          size="sm"
                          onClick={() => action.onClick(item)}
                          disabled={action.disabled ? action.disabled(item) : false}
                          title={action.label}
                          className="p-2"
                        >
                          {action.icon}
                        </Button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-700">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} results
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              Previous
            </Button>
            
            <span className="text-sm text-slate-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;