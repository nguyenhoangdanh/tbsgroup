import { ReactNode } from 'react';

// Admin user types
export interface AdminUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalInquiries: number;
  totalUsers: number;
  recentInquiries: CustomerInquiry[];
  monthlyInquiries: number[];
  weeklyInquiries: number[];
  categoryDistribution: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  performanceMetrics: {
    averageResponseTime: number;
    inquiryTrends: Array<{
      date: string;
      inquiries: number;
      responses: number;
    }>;
  };
}

// Navigation and breadcrumbs
export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
  icon?: ReactNode;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
  children?: NavigationItem[];
  permission?: 'ADMIN' | 'SUPER_ADMIN';
}

// Layout types
export interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  sidebar?: boolean;
  user: AdminUser;
}

export interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
  user: AdminUser;
}

export interface AdminHeaderProps {
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  user: AdminUser;
  onSidebarToggle: () => void;
  sidebarOpen?: boolean;
}

export interface UserMenuProps {
  user: AdminUser;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

// Manager component props
export interface CategoriesManagerProps {
  locale: string;
}

export interface ProductsManagerProps {
  locale: string;
}

export interface UsersManagerProps {
  locale: string;
}

export interface InquiriesManagerProps {
  locale: string;
}

// Data management types
export interface DataTableState {
  page: number;
  pageSize: number;
  search: string;
  filters: Record<string, any>;
  sorting: {
    field: string;
    direction: 'asc' | 'desc';
  } | null;
  selectedRows: string[];
}

export interface DataTableActions {
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  setSorting: (sorting: { field: string; direction: 'asc' | 'desc' } | null) => void;
  setSelectedRows: (rows: string[]) => void;
  resetFilters: () => void;
}

// Permission types
export type Permission = 'READ' | 'WRITE' | 'DELETE' | 'ADMIN';

export interface PermissionCheck {
  permission: Permission;
  resource: string;
  userId: string;
}

// Activity log types
export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ActivityLogProps {
  userId?: string;
  resource?: string;
  limit?: number;
  className?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onAction: (notification: Notification) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Export types
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  fields: string[];
  filters?: Record<string, any>;
  includeHeaders?: boolean;
  filename?: string;
}

export interface ExportProgress {
  status: 'preparing' | 'processing' | 'completed' | 'error';
  progress: number;
  downloadUrl?: string;
  error?: string;
}

// Import types
export interface ImportOptions {
  format: 'csv' | 'excel' | 'json';
  mapping: Record<string, string>;
  skipFirstRow?: boolean;
  validateOnly?: boolean;
}

export interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

// Customer inquiry types (for reference)
export interface CustomerInquiry {
  id: string;
  email: string;
  content: string;
  imageUrls: string[];
  productId?: string;
  product?: {
    id: string;
    name: Record<string, string>;
    slug: string;
  };
  status?: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedTo?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

// Settings types
export interface AdminSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  defaultLanguage: string;
  enabledLanguages: string[];
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  logoUrl?: string;
  faviconUrl?: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  seoSettings: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
  };
}

export interface SettingsFormProps {
  settings: AdminSettings;
  onSave: (settings: AdminSettings) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

// Role and permission management
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleFormProps {
  role?: Role;
  onSave: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}