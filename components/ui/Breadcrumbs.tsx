import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BreadcrumbsProps } from '@/types/ui';

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator,
  className,
  ...props
}) => {
  const defaultSeparator = (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)} {...props}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="flex-shrink-0">
              {separator || defaultSeparator}
            </span>
          )}
          
          <div className="flex items-center space-x-1">
            {item.icon && (
              <span className="flex-shrink-0 text-slate-400">
                {item.icon}
              </span>
            )}
            
            {item.href && !item.current ? (
              <Link
                href={item.href}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(
                'font-medium',
                item.current ? 'text-slate-900' : 'text-slate-500'
              )}>
                {item.label}
              </span>
            )}
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;