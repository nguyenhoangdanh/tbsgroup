'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TableProps, TableColumn, SortingState } from '@/types/ui';
import Button from './Button';
import Badge from './Badge';
import Loading from './Loading';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

function Table<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  pagination,
  sorting,
  onSort,
  onPageChange,
  onPageSizeChange,
  selectedRows = [],
  onRowSelect,
  onRowClick,
  actions = [],
  emptyState,
  className,
  ...props
}: TableProps<T>) {
  const [localSorting, setLocalSorting] = useState<SortingState | null>(sorting || null);

  const handleSort = (field: string) => {
    if (!onSort) return;

    const currentField = localSorting?.field;
    const currentDirection = localSorting?.direction;

    let newDirection: 'asc' | 'desc' = 'asc';

    if (currentField === field) {
      newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    }

    const newSorting = { field, direction: newDirection };
    setLocalSorting(newSorting);
    onSort(field, newDirection);
  };

  const handleRowSelect = (id: string, checked: boolean) => {
    if (!onRowSelect) return;

    let newSelection = [...selectedRows];
    if (checked) {
      newSelection.push(id);
    } else {
      newSelection = newSelection.filter(rowId => rowId !== id);
    }
    onRowSelect(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onRowSelect) return;

    if (checked) {
      const allIds = data.map(item => item.id);
      onRowSelect(allIds);
    } else {
      onRowSelect([]);
    }
  };

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  const renderCellValue = (column: TableColumn<T>, item: T, index: number) => {
    const value = typeof column.key === 'string' ? item[column.key] : null;

    if (column.render) {
      return column.render(value, item, index);
    }

    // Default rendering based on value type
    if (value === null || value === undefined) {
      return <span className="text-slate-400">—</span>;
    }

    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'success' : 'neutral'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    }

    if (Array.isArray(value)) {
      return <span>{value.length} items</span>;
    }

    if (typeof value === 'object') {
      return <span className="text-slate-400">Object</span>;
    }

    return <span>{String(value)}</span>;
  };

  const tableClasses = cn('table', className);

  if (isLoading) {
    return (
      <div className="space-y-4" {...props}>
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Loading />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {emptyState || (
          <EmptyState
            icon={(
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2" />
              </svg>
            )}
            title="No data available"
            description="There are no items to display at the moment."
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4" {...props}>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="data-table">
          <div className="overflow-x-auto">
            <table className={tableClasses}>
              <thead className="table-header">
                <tr>
                  {onRowSelect && (
                    <th className="w-12 px-6 py-3">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                      />
                    </th>
                  )}

                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      className={cn(
                        'px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider',
                        {
                          'cursor-pointer hover:bg-slate-100 select-none': column.sortable,
                          'text-center': column.align === 'center',
                          'text-right': column.align === 'right',
                          'sticky left-0 bg-slate-50 z-10': column.sticky,
                        }
                      )}
                      style={column.width ? { width: column.width } : undefined}
                      onClick={() => column.sortable && handleSort(String(column.key))}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.label}</span>
                        {column.sortable && (
                          <span className="ml-2">
                            {localSorting?.field === column.key ? (
                              localSorting.direction === 'asc' ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )
                            ) : (
                              <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}

                  {actions.length > 0 && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-200">
                {data.map((item, index) => (
                  <motion.tr
                    key={item.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'table-row',
                      {
                        'cursor-pointer': onRowClick,
                        'bg-slate-50': selectedRows.includes(item.id),
                      }
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {onRowSelect && (
                      <td className="table-cell w-12">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleRowSelect(item.id, e.target.checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                        />
                      </td>
                    )}

                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={cn(
                          'table-cell',
                          {
                            'text-center': column.align === 'center',
                            'text-right': column.align === 'right',
                            'sticky left-0 bg-white z-10': column.sticky,
                          }
                        )}
                      >
                        {renderCellValue(column, item, index)}
                      </td>
                    ))}

                    {actions.length > 0 && (
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {actions.map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant={action.variant || 'ghost'}
                              size="sm"
                              onClick={(e) => {
                                e?.stopPropagation();
                                action.onClick(item);
                              }}
                              disabled={action.disabled?.(item)}
                              icon={action.icon}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards - visible only on small screens via globals.css */}
          <div className="mobile-cards">
            {data.map((item, idx) => (
              <div key={item.id || idx} className="mobile-card">
                <div className="mobile-card-header">
                  <div className="flex items-center space-x-3">
                    {/* Try to render first column thumbnail or title */}
                    {columns[0] && typeof columns[0].key === 'string' && columns[0].key === 'thumbnail' ? (
                      <div className="w-10 h-10">
                        {item[columns[0].key] ? (
                          <img src={item[columns[0].key]} alt="" className="w-10 h-10 object-cover rounded-lg" />
                        ) : (
                          <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                        )}
                      </div>
                    ) : null}

                    <div className="flex-1">
                      <div className="font-medium text-slate-900 truncate">
                        {/* Fallback to first text column */}
                        {(() => {
                          const textCol = columns.find(col => col.key && typeof col.key === 'string' && col.key !== 'thumbnail');
                          if (textCol) return String(item[textCol.key as string] ?? '');
                          return '';
                        })()}
                      </div>
                      <div className="text-sm text-slate-500 truncate">{item.slug || ''}</div>
                    </div>
                  </div>
                </div>

                <div className="mobile-card-body">
                  {columns.map((col, i) => (
                    <div key={String(col.key) + i} className="mobile-card-field">
                      <div className="mobile-card-label">{col.label}</div>
                      <div className="mobile-card-value">{renderCellValue(col, item, idx)}</div>
                    </div>
                  ))}

                  {actions.length > 0 && (
                    <div className="mobile-card-actions">
                      {actions.map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          variant={action.variant || 'ghost'}
                          size="sm"
                          onClick={(e) => {
                            e?.stopPropagation();
                            action.onClick(item);
                          }}
                          disabled={action.disabled?.(item)}
                          icon={action.icon}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pagination && (
        <Pagination
          current={pagination.page}
          total={pagination.total}
          pageSize={pagination.pageSize}
          onChange={onPageChange || (() => {})}
          onPageSizeChange={onPageSizeChange}
          showSizeChanger
          showTotal
        />
      )}
    </div>
  );
}

export default Table;
