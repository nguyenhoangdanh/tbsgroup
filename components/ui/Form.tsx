import React from 'react';
import { cn } from '@/lib/utils';

interface FormGroupProps {
  label?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  required,
  error,
  children,
  className
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  onChange?: (value: string) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required,
  leftIcon,
  onChange,
  className,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-slate-400">{leftIcon}</div>
          </div>
        )}
        <input
          className={cn(
            'w-full px-3 py-2 border rounded-lg text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            leftIcon && 'pl-10',
            error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-slate-300 hover:border-slate-400',
            className
          )}
          onChange={handleChange}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="text-sm text-slate-500">{helperText}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  className,
  error,
  ...props
}) => {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 border rounded-lg text-sm transition-colors resize-none',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        error 
          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
          : 'border-slate-300 hover:border-slate-400',
        className
      )}
      {...props}
    />
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({
  className,
  error,
  options,
  ...props
}) => {
  return (
    <select
      className={cn(
        'w-full px-3 py-2 border rounded-lg text-sm transition-colors bg-white',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        error 
          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
          : 'border-slate-300 hover:border-slate-400',
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};