import React from 'react';
import { clsx } from 'clsx';
import { InputProps } from '@/types/ui';

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  type = 'text',
  value,
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  leftIcon,
  rightIcon,
  autoComplete,
  className,
  children,
  ...props
}) => {
  const inputId = React.useId();
  
  const inputClasses = clsx(
    'input-base',
    {
      'input': !error,
      'input-error': error,
      'pl-10': leftIcon,
      'pr-10': rightIcon,
      'cursor-not-allowed opacity-75': disabled,
    },
    className
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-slate-400 text-sm">
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          id={inputId}
          type={type}
          value={value || ''}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-slate-400 text-sm">
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="error-text">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="helper-text">
          {helperText}
        </p>
      )}
      
      {children}
    </div>
  );
};

export default Input;