import React from 'react';
import { cn } from '@/lib/utils';
import { EmptyStateProps } from '@/types/ui';
import Button from './Button';

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
  children,
  ...props
}) => {
  const defaultIcon = (
    <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)} {...props}>
      <div className="text-center">
        <div className="mb-4">
          {icon || defaultIcon}
        </div>
        
        {title && (
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {title}
          </h3>
        )}
        
        {description && (
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            {description}
          </p>
        )}
        
        {action && (
          <Button
            variant="primary"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
        
        {children}
      </div>
    </div>
  );
};

// Specific empty state components for common use cases
export const EmptyTableState: React.FC<{
  title?: string;
  description?: string;
  onCreateNew?: () => void;
  createLabel?: string;
}> = ({
  title = "No data available",
  description = "There are no items to display at the moment.",
  onCreateNew,
  createLabel = "Create New"
}) => (
  <EmptyState
    icon={
      <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2" />
      </svg>
    }
    title={title}
    description={description}
    action={onCreateNew ? {
      label: createLabel,
      onClick: onCreateNew
    } : undefined}
  />
);

export const EmptySearchState: React.FC<{
  query?: string;
  onClearSearch?: () => void;
}> = ({
  query,
  onClearSearch
}) => (
  <EmptyState
    icon={
      <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    title="No results found"
    description={query ? `We couldn't find anything matching "${query}". Try different keywords or clear the search.` : "Try adjusting your search or filters to find what you're looking for."}
    action={onClearSearch ? {
      label: "Clear Search",
      onClick: onClearSearch
    } : undefined}
  />
);

export const EmptyInboxState: React.FC = () => (
  <EmptyState
    icon={
      <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2" />
      </svg>
    }
    title="All caught up!"
    description="You have no new messages or notifications."
  />
);

export const ErrorState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
}> = ({
  title = "Something went wrong",
  description = "An error occurred while loading the data. Please try again.",
  onRetry
}) => (
  <EmptyState
    icon={
      <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    }
    title={title}
    description={description}
    action={onRetry ? {
      label: "Try Again",
      onClick: onRetry
    } : undefined}
  />
);

export default EmptyState;