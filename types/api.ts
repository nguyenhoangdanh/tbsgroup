// API response wrapper types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: Record<string, any>;
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: any;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
  timestamp: string;
}

// Request types
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryParams extends PaginationParams {
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  featured?: boolean;
}

export interface ProductParams extends PaginationParams {
  categoryId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  hasImages?: boolean;
}

export interface UserParams extends PaginationParams {
  role?: 'ADMIN' | 'SUPER_ADMIN';
  status?: 'ACTIVE' | 'INACTIVE';
  createdAfter?: string;
  createdBefore?: string;
}

export interface InquiryParams extends PaginationParams {
  status?: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  productId?: string;
  assignedTo?: string;
  createdAfter?: string;
  createdBefore?: string;
  hasImages?: boolean;
}

// API endpoint types
export type ApiEndpoint = 
  | '/api/admin/categories'
  | '/api/admin/products'
  | '/api/admin/users'
  | '/api/admin/inquiries'
  | '/api/categories'
  | '/api/products'
  | '/api/inquiry'
  | '/api/upload-url'
  | '/api/auth/login'
  | '/api/auth/logout'
  | '/api/auth/register';

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API client configuration
export interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
}

// Request configuration
export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

// API hooks return types
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export interface UsePaginatedApiResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilters: (filters: Record<string, any>) => void;
  setSorting: (field: string, direction: 'asc' | 'desc') => void;
}

export interface UseMutationResult<T> {
  mutate: (data: any) => Promise<T>;
  loading: boolean;
  error: ApiError | null;
  reset: () => void;
}

// File upload types
export interface UploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  fields: Record<string, string>;
}

export interface FileUploadProgress {
  progress: number;
  loaded: number;
  total: number;
}

export interface FileUploadResult {
  url: string;
  key: string;
  size: number;
  type: string;
}

// Batch operation types
export interface BatchOperation {
  action: 'create' | 'update' | 'delete';
  data: any;
  id?: string;
}

export interface BatchOperationResult {
  success: number;
  failed: number;
  errors: Array<{
    operation: BatchOperation;
    error: ValidationError;
  }>;
}

// Search types
export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  facets?: string[];
  page?: number;
  pageSize?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  facets?: Record<string, Array<{
    value: string;
    count: number;
  }>>;
  suggestions?: string[];
}

// Analytics API types
export interface AnalyticsParams {
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
  metrics?: string[];
}

export interface AnalyticsData {
  metrics: Record<string, number>;
  timeseries: Array<{
    date: string;
    [metric: string]: number | string;
  }>;
  breakdown: Record<string, Array<{
    label: string;
    value: number;
    percentage: number;
  }>>;
}

// Cache types
export interface CacheConfig {
  key: string;
  ttl?: number; // time to live in seconds
  staleWhileRevalidate?: boolean;
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // timestamp
}

// Webhook types
export interface WebhookEvent {
  type: string;
  data: any;
  timestamp: string;
  source: string;
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
}

// Export/Import API types
export interface ExportRequest {
  type: 'categories' | 'products' | 'users' | 'inquiries';
  format: 'csv' | 'excel' | 'json';
  filters?: Record<string, any>;
  fields?: string[];
}

export interface ExportStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ImportRequest {
  type: 'categories' | 'products' | 'users';
  format: 'csv' | 'excel' | 'json';
  fileUrl: string;
  mapping: Record<string, string>;
  options?: {
    skipFirstRow?: boolean;
    updateExisting?: boolean;
    validateOnly?: boolean;
  };
}

export interface ImportStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total?: number;
  processed?: number;
  successful?: number;
  failed?: number;
  errors?: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  createdAt: string;
  completedAt?: string;
}