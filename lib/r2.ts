import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export interface UploadRequest {
  filename: string;
  contentType: string;
}

export interface UploadResponse {
  filename: string;
  key: string;
  url: string;
  publicUrl: string;
}

export function generateKey(filename: string, type: 'inquiry' | 'category' | 'product' = 'inquiry'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const slug = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Organize files by type as specified in problem statement
  const typeFolder = type === 'inquiry' ? 'inquiries' : 
                    type === 'category' ? 'categories' : 
                    'products';
  
  return `${typeFolder}/${timestamp}-${random}-${slug}`;
}

export async function createPresignedUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export function getPublicUrl(key: string): string {
  return `${process.env.CLOUDFLARE_R2_PUBLIC_BASE}/${key}`;
}

export function validateImageType(contentType: string): boolean {
  const allowedTypes = [
    'image/jpeg', 
    'image/jpg',
    'image/png', 
    'image/webp',
    'image/gif' // Added GIF support
  ];
  return allowedTypes.includes(contentType.toLowerCase());
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
export const MAX_FILES = 10; // Increased to 10 files max as per requirements
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];