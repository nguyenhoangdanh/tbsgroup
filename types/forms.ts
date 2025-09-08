import { ReactNode } from 'react';

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
  className?: string;
}

export interface FormState {
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  errors: ValidationError[];
}

// Multi-language form types
export interface MultiLanguageField {
  vi: string;
  en: string;
  id: string;
}

export interface MultiLanguageEditorProps {
  value: MultiLanguageField;
  onChange: (value: MultiLanguageField) => void;
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: Partial<MultiLanguageField>;
  disabled?: boolean;
  type?: 'text' | 'textarea' | 'rich';
}

// Category form types
export interface CategoryFormData {
  name: MultiLanguageField;
  slug: string;
  description?: MultiLanguageField;
  thumbnail?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  sortOrder: number;
}

export interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

// Product form types
export interface ProductSpecification {
  [key: string]: any;
}

export interface ProductFormData {
  name: MultiLanguageField;
  slug: string;
  description?: MultiLanguageField;
  shortDesc?: MultiLanguageField;
  price?: number;
  originalPrice?: number;
  images: string[];
  specifications?: ProductSpecification;
  categoryId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  featured: boolean;
  sortOrder: number;
  seoTitle?: MultiLanguageField;
  seoDesc?: MultiLanguageField;
}

export interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
  categories: Array<{
    id: string;
    name: MultiLanguageField;
  }>;
}

// User form types
export interface UserFormData {
  email: string;
  password?: string;
  confirmPassword?: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  firstName?: string;
  lastName?: string;
}

export interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

// Bulk action form types
export interface BulkActionOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  confirmMessage?: string;
}

export interface BulkActionFormProps {
  selectedItems: string[];
  actions: BulkActionOption[];
  onAction: (action: string, itemIds: string[]) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  entityType: string;
}

// Search and filter types
export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'range' | 'boolean';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export interface SearchAndFilterProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterOption[];
  filterValues?: Record<string, any>;
  onFilterChange?: (filters: Record<string, any>) => void;
  onReset?: () => void;
  className?: string;
}

// Image gallery manager types
export interface ImageItem {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface ImageGalleryManagerProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  onUpload: (files: File[]) => Promise<ImageItem[]>;
  onDelete: (imageId: string) => Promise<void>;
  maxImages?: number;
  acceptedTypes?: string[];
  maxFileSize?: number;
  disabled?: boolean;
  className?: string;
}

// SEO metadata form types
export interface SEOMetadataFormProps {
  title: MultiLanguageField;
  description: MultiLanguageField;
  onTitleChange: (title: MultiLanguageField) => void;
  onDescriptionChange: (description: MultiLanguageField) => void;
  disabled?: boolean;
  className?: string;
}

// Form step types for multi-step wizards
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  validation?: () => Promise<boolean>;
  optional?: boolean;
}

export interface MultiStepFormProps {
  steps: FormStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

// Form field error types
export interface FieldError {
  type: string;
  message: string;
}

export interface FormErrors {
  [fieldName: string]: FieldError;
}

// Autocomplete form field types
export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

export interface AutocompleteProps {
  options: AutocompleteOption[];
  value?: string;
  onChange?: (value: string) => void;
  onInputChange?: (input: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  clearable?: boolean;
  createable?: boolean;
  onCreateOption?: (input: string) => Promise<AutocompleteOption>;
}

// Rich text editor types
export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  toolbar?: string[];
  maxLength?: number;
  className?: string;
}

// Date picker types
export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  showTime?: boolean;
  className?: string;
}

// Number input types
export interface NumberInputProps {
  value?: number;
  onChange?: (value: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}