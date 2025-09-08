// Utility functions for the application
import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date, locale: string = 'vi'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  return 'unknown';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Get localized content from a JSON field
 * @param jsonField - The JSON field containing multilingual content
 * @param locale - Current locale (vi, en, id)
 * @param fallback - Fallback value if content not found
 * @returns Localized content string
 */
export function getLocalizedContent(
  jsonField: any,
  locale: string,
  fallback?: string
): string {
  if (!jsonField || typeof jsonField !== 'object') {
    return fallback || '';
  }

  // Try to get content for the requested locale
  if (jsonField[locale]) {
    return jsonField[locale];
  }

  // Fallback to Vietnamese (default)
  if (jsonField.vi) {
    return jsonField.vi;
  }

  // Fallback to English
  if (jsonField.en) {
    return jsonField.en;
  }

  // Fallback to Indonesian
  if (jsonField.id) {
    return jsonField.id;
  }

  // Fallback to any available value
  const values = Object.values(jsonField);
  if (values.length > 0 && typeof values[0] === 'string') {
    return values[0];
  }

  return fallback || '';
}

/**
 * Format price in Vietnamese Dong
 * @param price - Price in VND
 * @param locale - Locale for formatting
 * @returns Formatted price string
 */
export function formatPrice(price: number | null, locale: string = 'vi'): string {
  if (price === null || price === undefined) {
    return locale === 'vi' ? 'Liên hệ' : locale === 'en' ? 'Contact' : 'Kontak';
  }

  if (locale === 'vi') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }

  // For EN and ID, show VND with proper formatting
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as T;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sleep function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse JSON safely
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Get nested object value by path
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}