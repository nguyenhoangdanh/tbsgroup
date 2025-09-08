import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paginationSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize, search, sort, order } = paginationSchema.parse({
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
      search: searchParams.get('search'),
      sort: searchParams.get('sort') || 'sortOrder',
      order: searchParams.get('order') || 'asc',
    });

    const skip = (page - 1) * pageSize;

    const where: any = {
      status: 'ACTIVE' // Only show active categories to public
    };

    if (search) {
      where.OR = [
        { name: { path: ['vi'], string_contains: search } },
        { name: { path: ['en'], string_contains: search } },
        { name: { path: ['id'], string_contains: search } },
        { description: { path: ['vi'], string_contains: search } },
        { description: { path: ['en'], string_contains: search } },
        { description: { path: ['id'], string_contains: search } },
      ];
    }

    const orderBy: any = {};
    if (sort === 'name') {
      orderBy.name = { path: ['vi'], sort: order };
    } else {
      orderBy[sort] = order;
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          _count: {
            select: { 
              products: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        }
      }),
      prisma.category.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: categories,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
      },
    });
  } catch (error) {
    console.error('Public categories fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch categories'
        }
      },
      { status: 500 }
    );
  }
}