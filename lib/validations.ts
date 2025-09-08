import { z } from 'zod';

// Multilingual content schema
export const multilingualContentSchema = z.object({
  vi: z.string().min(1, 'Vietnamese content is required'),
  en: z.string().min(1, 'English content is required'),
  id: z.string().min(1, 'Indonesian content is required'),
});

// Contact inquiry schema
export const contactInquirySchema = z.object({
  email: z.string().email('Invalid email address'),
  content: z.string().trim().min(10, 'Content must be at least 10 characters').max(2000, 'Content must be less than 2000 characters'),
  imageUrls: z.array(z.string().url()).max(5, 'Maximum 5 images allowed'),
  productId: z.string().uuid().optional(),
});

// Upload request schema
export const uploadRequestSchema = z.object({
  files: z.array(
    z.object({
      filename: z.string().min(1, 'Filename is required'),
      contentType: z.string().min(1, 'Content type is required'),
    })
  ).max(5, 'Maximum 5 files allowed'),
  type: z.enum(['inquiry', 'category', 'product']).default('inquiry'),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Admin user schema
export const adminUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.enum(['ADMIN', 'SUPER_ADMIN']).default('ADMIN'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
});

export const adminUserUpdateSchema = adminUserSchema.partial().extend({
  id: z.string().uuid(),
});

// Category schema
export const categorySchema = z.object({
  name: multilingualContentSchema,
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: multilingualContentSchema.optional(),
  thumbnail: z.string().url().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).default('ACTIVE'),
  sortOrder: z.number().int().min(0).default(0),
});

export const categoryUpdateSchema = categorySchema.partial().extend({
  id: z.string().uuid(),
});

// Product schema
export const productSchema = z.object({
  name: multilingualContentSchema,
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: multilingualContentSchema.optional(),
  shortDesc: multilingualContentSchema.optional(),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  specifications: z.record(z.string(), multilingualContentSchema).optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).default('ACTIVE'),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  seoTitle: multilingualContentSchema.optional(),
  seoDesc: multilingualContentSchema.optional(),
});

export const productUpdateSchema = productSchema.partial().extend({
  id: z.string().uuid(),
});

// Query parameters schemas
export const paginationSchema = z.object({
  page: z.string().nullable().optional().transform(val => parseInt(val || '1') || 1).pipe(z.number().int().min(1)),
  pageSize: z.string().nullable().optional().transform(val => parseInt(val || '10') || 10).pipe(z.number().int().min(1).max(50)),
  search: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).optional(),
  sort: z.enum(['name', 'price', 'createdAt', 'updatedAt', 'sortOrder']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const productFilterSchema = paginationSchema.extend({
  categoryId: z.string().uuid().optional(),
  featured: z.string().nullable().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  minPrice: z.string().nullable().optional().transform(val => val && val !== '' ? parseFloat(val) : undefined).pipe(z.number().positive().optional()),
  maxPrice: z.string().nullable().optional().transform(val => val && val !== '' ? parseFloat(val) : undefined).pipe(z.number().positive().optional()),
});

// Type exports
export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AdminUserInput = z.infer<typeof adminUserSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
export type MultilingualContent = z.infer<typeof multilingualContentSchema>;