import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { paginationSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    // Check authentication (both ADMIN and SUPER_ADMIN can view inquiries)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { page, pageSize, search, sort, order } = paginationSchema.parse({
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
      search: searchParams.get('search'),
      sort: searchParams.get('sort') || 'createdAt',
      order: searchParams.get('order') || 'desc',
    });

    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [inquiries, total] = await Promise.all([
      prisma.customerInquiry.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: pageSize,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            }
          }
        }
      }),
      prisma.customerInquiry.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: inquiries,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
      },
    });
  } catch (error) {
    console.error('Admin inquiries fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch inquiries'
        }
      },
      { status: 500 }
    );
  }
}