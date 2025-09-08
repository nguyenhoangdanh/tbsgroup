// Utility functions for the application

export function cn(...inputs: string[]) {
  return inputs.filter(Boolean).join(' ');
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