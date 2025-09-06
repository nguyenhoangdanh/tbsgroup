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
          error: 'Too many requests. Please wait before submitting again.',
          resetTime: rateLimitResult.resetTime 
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = contactInquirySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.errors },
        { status: 400 }
      );
    }

    const { email, content, imageUrls } = result.data;

    // Save to database
    const inquiry = await prisma.customerInquiry.create({
      data: {
        email,
        content,
        imageUrls,
      },
    });

    console.log('New inquiry created:', inquiry.id);

    return NextResponse.json({ 
      success: true,
      message: 'Inquiry submitted successfully'
    });
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}