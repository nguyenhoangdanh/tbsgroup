import React from 'react';
import { cn } from '@/lib/utils';
import { IconButtonProps } from '@/types/ui';
import Button from './Button';

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  disabled = false,
  variant = 'ghost',
  size = 'md',
  tooltip,
  isLoading = false,
  className,
  ...props
}) => {
  return (
    <div className="relative group">
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled}
        loading={isLoading}
        icon={icon}
        className={cn('p-2', className)}
        {...props}
      />
      
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};

export default IconButton;