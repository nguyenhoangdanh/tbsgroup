import { ReactNode } from 'react';

// Base UI component interfaces
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Button component types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'accent';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends BaseComponentProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Input component types
export interface InputProps extends BaseComponentProps {
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'tel' | 'search';
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  autoComplete?: string;
}

// Table component types
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, item: T, index: number) => ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
}

export interface TableAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (item: T) => void;
  disabled?: (item: T) => boolean;
  variant?: ButtonVariant;
}

export interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SortingState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  [key: string]: any;
}

export interface TableProps<T> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  pagination?: PaginationData;
  sorting?: SortingState;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  selectedRows?: string[];
  onRowSelect?: (ids: string[]) => void;
  onRowClick?: (item: T) => void;
  actions?: TableAction<T>[];
  emptyState?: ReactNode;
  bulkActions?: TableAction<T[]>;
}

// Modal component types
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  footer?: ReactNode;
}

// Card component types
export interface CardProps extends BaseComponentProps {
  header?: ReactNode;
  footer?: ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// Badge component types
export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends BaseComponentProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
}

// Avatar component types
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  fallback?: string;
}

// Dropdown component types
export interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface DropdownProps extends BaseComponentProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
}

// Select component types
export interface SelectProps extends BaseComponentProps {
  options: DropdownOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
}

// Textarea component types
export interface TextareaProps extends BaseComponentProps {
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  rows?: number;
  autoResize?: boolean;
  maxLength?: number;
}

// File upload component types
export interface FileUploadProps extends BaseComponentProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  disabled?: boolean;
  label?: string;
  description?: string;
  error?: string;
}

// Toast component types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Loading component types
export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export interface SkeletonProps extends BaseComponentProps {
  width?: string | number;
  height?: string | number;
  count?: number;
  circle?: boolean;
}

// Tabs component types
export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  content?: ReactNode;
}

export interface TabsProps extends BaseComponentProps {
  items: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

// Pagination component types
export interface PaginationProps extends BaseComponentProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  pageSizeOptions?: number[];
}

// Search component types
export interface SearchBoxProps extends BaseComponentProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  debounceMs?: number;
  clearable?: boolean;
}

// Empty state component types
export interface EmptyStateProps extends BaseComponentProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Confirm dialog component types
export interface ConfirmDialogProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'destructive';
  isLoading?: boolean;
}

// Form field wrapper types
export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

// Icon button types
export interface IconButtonProps extends BaseComponentProps {
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  tooltip?: string;
  isLoading?: boolean;
}

// Breadcrumbs types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
  icon?: ReactNode;
}

export interface BreadcrumbsProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}

// Progress bar types
export interface ProgressBarProps extends BaseComponentProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  animated?: boolean;
}

// Switch types
export interface SwitchProps extends BaseComponentProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
}

// Checkbox types
export interface CheckboxProps extends BaseComponentProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  indeterminate?: boolean;
}

// Radio types
export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioProps extends BaseComponentProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  name: string;
  direction?: 'horizontal' | 'vertical';
}