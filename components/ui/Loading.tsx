import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingProps, SkeletonProps } from '@/types/ui';

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  color = 'slate-600',
  className,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const spinnerClasses = cn(
    'spinner',
    sizeClasses[size],
    `border-t-${color}`,
    className
  );

  return (
    <div className="flex items-center justify-center py-8" {...props}>
      <div className={spinnerClasses} />
      {children && (
        <span className="ml-3 text-slate-600">
          {children}
        </span>
      )}
    </div>
  );
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  count = 1,
  circle = false,
  className,
  ...props
}) => {
  const skeletonClasses = cn(
    'skeleton',
    {
      'rounded-full': circle,
      'rounded-md': !circle,
    },
    className
  );

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (count === 1) {
    return <div className={skeletonClasses} style={style} {...props} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClasses} style={style} />
      ))}
    </div>
  );
};

// Table skeleton loader
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4
}) => (
  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
    <div className="p-6">
      {/* Header skeleton */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} height={20} />
        ))}
      </div>
      
      {/* Rows skeleton */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} height={16} />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Card skeleton loader
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="card p-6">
        <Skeleton height={40} className="mb-4" />
        <Skeleton height={20} className="mb-2" />
        <Skeleton height={16} width="60%" className="mb-4" />
        <div className="flex space-x-2">
          <Skeleton height={32} width={80} />
          <Skeleton height={32} width={80} />
        </div>
      </div>
    ))}
  </div>
);

// Form skeleton loader
export const FormSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton height={16} width="25%" />
      <Skeleton height={40} />
    </div>
    <div className="space-y-2">
      <Skeleton height={16} width="30%" />
      <Skeleton height={40} />
    </div>
    <div className="space-y-2">
      <Skeleton height={16} width="20%" />
      <Skeleton height={80} />
    </div>
    <div className="flex space-x-3">
      <Skeleton height={40} width={100} />
      <Skeleton height={40} width={80} />
    </div>
  </div>
);

export default Loading;