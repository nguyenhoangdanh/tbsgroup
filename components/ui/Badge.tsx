import React from 'react';
import { clsx } from 'clsx';
import { BadgeProps } from '@/types/ui';

const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  icon,
  className,
  children,
  ...props
}) => {
  const baseClasses = 'badge-base';
  
  const variantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    neutral: 'badge-neutral'
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm'
  };

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <span className={classes} {...props}>
      {icon && (
        <span className={clsx('flex-shrink-0', children && 'mr-1')}>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;