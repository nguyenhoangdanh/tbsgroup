import React from 'react';
import { clsx } from 'clsx';
import { CardProps } from '@/types/ui';

const Card: React.FC<CardProps> = ({
  header,
  footer,
  hoverable = false,
  padding = 'md',
  className,
  children,
  ...props
}) => {
  const cardClasses = clsx(
    'card',
    {
      'hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer': hoverable,
    },
    className
  );

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={cardClasses} {...props}>
      {header && (
        <div className="card-header">
          {header}
        </div>
      )}
      
      <div className={clsx('card-body', paddingClasses[padding])}>
        {children}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;