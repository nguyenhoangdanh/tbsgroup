import React from 'react';
import { cn } from '@/lib/utils';
import { PaginationProps } from '@/types/ui';
import Button from './Button';

const Pagination: React.FC<PaginationProps> = ({
  current,
  total,
  pageSize,
  onChange,
  onPageSizeChange,
  showSizeChanger = false,
  showQuickJumper = false,
  showTotal = false,
  pageSizeOptions = [10, 20, 50, 100],
  className,
  ...props
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (current - 1) * pageSize + 1;
  const endItem = Math.min(current * pageSize, total);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(totalPages - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageChange = (page: number) => {
    if (page !== current && page >= 1 && page <= totalPages) {
      onChange(page);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  if (totalPages <= 1 && !showTotal) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-between', className)} {...props}>
      {/* Left side - Total count and page size selector */}
      <div className="flex items-center space-x-4">
        {showTotal && (
          <span className="text-sm text-slate-700">
            Showing {startItem} to {endItem} of {total} results
          </span>
        )}
        
        {showSizeChanger && onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-700">Show</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="input text-sm py-1 px-2 w-auto min-w-0"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-slate-700">per page</span>
          </div>
        )}
      </div>

      {/* Right side - Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* Quick jumper */}
        {showQuickJumper && (
          <div className="flex items-center space-x-2 mr-4">
            <span className="text-sm text-slate-700">Go to</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              className="input text-sm py-1 px-2 w-16"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt((e.target as HTMLInputElement).value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                  }
                }
              }}
            />
            <span className="text-sm text-slate-700">of {totalPages}</span>
          </div>
        )}

        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(current - 1)}
          disabled={current === 1}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          }
        >
          Previous
        </Button>

        {/* Page numbers */}
        {totalPages > 1 && (
          <div className="flex items-center space-x-1">
            {getVisiblePages().map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`dots-${index}`} className="px-2 py-1 text-slate-500">
                    ...
                  </span>
                );
              }

              const pageNumber = page as number;
              const isActive = pageNumber === current;

              return (
                <Button
                  key={pageNumber}
                  variant={isActive ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  className={cn(
                    'min-w-[2.5rem] justify-center',
                    isActive && 'pointer-events-none'
                  )}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>
        )}

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(current + 1)}
          disabled={current === totalPages}
          iconPosition="right"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;