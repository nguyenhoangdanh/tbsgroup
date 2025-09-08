import { NextRequest, NextResponse } from 'next/server';
import { contactInquirySchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 1 request per 15 seconds per IP
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(clientIP, 1, 15000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please wait before submitting again.',
            resetTime: rateLimitResult.resetTime
          }
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = contactInquirySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: result.error.errors
          }
        },
        { status: 400 }
      );
    }

    const { email, content, imageUrls, productId } = result.data;

    // Validate product exists if productId is provided
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true }
      });

      if (!product) {
        return NextResponse.json(
          { 
            success: false,
            error: {
              code: 'INVALID_PRODUCT',
              message: 'Product not found'
            }
          },
          { status: 400 }
        );
      }
    }

    // Save to database
    const inquiry = await prisma.customerInquiry.create({
      data: {
        email,
        content,
        imageUrls,
        productId,
      },
    });

    console.log('New inquiry created:', inquiry.id);

    return NextResponse.json({ 
      success: true,
      message: 'Inquiry submitted successfully',
      data: {
        id: inquiry.id
      }
    });
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'SUBMISSION_ERROR',
          message: 'Failed to submit inquiry'
        }
      },
      { status: 500 }
    );
  }
}