import { NextRequest, NextResponse } from 'next/server';
import { uploadRequestSchema } from '@/lib/validations';
import { 
  createPresignedUrl, 
  generateKey, 
  getPublicUrl, 
  validateImageType, 
  MAX_FILES 
} from '@/lib/r2';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(clientIP, 5, 60000); // 5 requests per minute
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.'
          }
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = uploadRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request',
            details: result.error.errors
          }
        },
        { status: 400 }
      );
    }

    const { files, type } = result.data;

    // Check file count
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'TOO_MANY_FILES',
            message: `Maximum ${MAX_FILES} files allowed`
          }
        },
        { status: 400 }
      );
    }

    // Validate file types and generate presigned URLs
    const uploads = await Promise.all(
      files.map(async (file) => {
        // Validate content type
        if (!validateImageType(file.contentType)) {
          throw new Error(`Invalid file type: ${file.contentType}`);
        }

        // Generate key with type prefix and presigned URL
        const key = generateKey(file.filename, type);
        const url = await createPresignedUrl(key, file.contentType);
        const publicUrl = getPublicUrl(key);

        return {
          filename: file.filename,
          key,
          url,
          publicUrl,
        };
      })
    );

    return NextResponse.json({ 
      success: true,
      data: { uploads }
    });
  } catch (error) {
    console.error('Upload URL generation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'UPLOAD_URL_ERROR',
          message: 'Failed to generate upload URLs'
        }
      },
      { status: 500 }
    );
  }
}