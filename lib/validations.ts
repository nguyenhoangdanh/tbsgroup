import { z } from 'zod';

export const contactInquirySchema = z.object({
  email: z.string().email('Invalid email address'),
  content: z.string().trim().min(10, 'Content must be at least 10 characters').max(2000, 'Content must be less than 2000 characters'),
  imageUrls: z.array(z.string().url()).max(5, 'Maximum 5 images allowed'),
});

export const uploadRequestSchema = z.object({
  files: z.array(
    z.object({
      filename: z.string().min(1, 'Filename is required'),
      contentType: z.string().min(1, 'Content type is required'),
    })
  ).max(5, 'Maximum 5 files allowed'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;
export type LoginInput = z.infer<typeof loginSchema>;