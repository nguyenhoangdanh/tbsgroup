import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortOrder = searchParams.get('sort') || 'desc';

    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedPageSize = Math.min(Math.max(1, pageSize), 100);
    const skip = (validatedPage - 1) * validatedPageSize;

    // Get total count
    const total = await prisma.customerInquiry.count();

    // Get inquiries with pagination
    const inquiries = await prisma.customerInquiry.findMany({
      orderBy: {
        createdAt: sortOrder === 'asc' ? 'asc' : 'desc',
      },
      skip,
      take: validatedPageSize,
      select: {
        id: true,
        email: true,
        content: true,
        imageUrls: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      data: inquiries,
      total,
      page: validatedPage,
      pageSize: validatedPageSize,
      totalPages: Math.ceil(total / validatedPageSize),
    });
  } catch (error) {
    console.error('Admin inquiries fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}