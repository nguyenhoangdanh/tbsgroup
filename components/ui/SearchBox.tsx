import React, { useState, useEffect } from 'react';
import { cn, debounce } from '@/lib/utils';
import { SearchBoxProps } from '@/types/ui';
import Input from './Input';
import Button from './Button';

const SearchBox: React.FC<SearchBoxProps> = ({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = 'Search...',
  disabled = false,
  loading = false,
  debounceMs = 300,
  clearable = true,
  className,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || '');

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  // Debounced search function
  const debouncedSearch = React.useMemo(
    () => debounce((searchTerm: string) => {
      onChange?.(searchTerm);
    }, debounceMs),
    [onChange, debounceMs]
  );

  const handleInputChange = (newValue: string) => {
    setInternalValue(newValue);
    debouncedSearch(newValue);
  };

  const handleSearch = () => {
    onSearch?.(internalValue);
  };

  const handleClear = () => {
    setInternalValue('');
    onChange?.('');
    onSearch?.('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className={cn('relative', className)} {...props}>
      <Input
        value={internalValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || loading}
        leftIcon={
          loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )
        }
        rightIcon={
          internalValue && clearable ? (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled || loading}
              className="text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : onSearch ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSearch}
              disabled={disabled || loading}
              className="h-6 px-2"
            >
              Search
            </Button>
          ) : null
        }
      />
    </div>
  );
};

export default SearchBox;