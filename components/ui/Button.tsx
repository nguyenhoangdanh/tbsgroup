import React from 'react';
import { clsx } from 'clsx';
import { ButtonProps } from '@/types/ui';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  children,
  onClick,
  type = 'button',
  className,
  ...props
}) => {
  const baseClasses = 'btn-base inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary', 
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    destructive: 'btn-destructive',
    accent: 'btn-accent'
  };

  const sizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm', 
    md: 'btn-md',
    lg: 'btn-lg',
    xl: 'btn-xl'
  };

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    {
      'w-full': fullWidth,
      'cursor-not-allowed': disabled || isLoading,
    },
    className
  );

  const iconElement = isLoading ? (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  ) : icon;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={classes}
      {...props}
    >
      {iconElement && iconPosition === 'left' && (
        <span className={clsx('flex-shrink-0', children && 'mr-2')}>
          {iconElement}
        </span>
      )}
      
      {children && (
        <span className={clsx(isLoading && 'opacity-70')}>
          {children}
        </span>
      )}
      
      {iconElement && iconPosition === 'right' && (
        <span className={clsx('flex-shrink-0', children && 'ml-2')}>
          {iconElement}
        </span>
      )}
    </button>
  );
};

export default Button;