"use server";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productSchema, productFilterSchema } from '@/lib/validations';

// Check if user is SuperAdmin
async function checkSuperAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication (both ADMIN and SUPER_ADMIN can view)
    const session = await getServerSession(authOptions);
    console.log('Session data:', session);
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
    
    // Parse query parameters directly without schema validation
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured') === 'true' ? true : searchParams.get('featured') === 'false' ? false : undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;

    const skip = (page - 1) * pageSize;

    const where: any = {};

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

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    const orderBy: any = {};
    if (sort === 'name') {
      orderBy.name = { path: ['vi'], sort: order };
    } else {
      orderBy[sort] = order;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          _count: {
            select: { inquiries: true }
          }
        }
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
      },
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch products'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check SuperAdmin authorization
    const isAuthorized = await checkSuperAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json({ 
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Super Admin access required'
        }
      }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'DUPLICATE_SLUG',
            message: 'Product with this slug already exists'
          }
        },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_CATEGORY',
            message: 'Category not found'
          }
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: validatedData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        _count: {
          select: { inquiries: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'DUPLICATE_SLUG',
            message: 'Product with this slug already exists'
          }
        },
        { status: 400 }
      );
    }
    if (error && typeof error === 'object' && 'errors' in error) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: error.errors
          }
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create product'
        }
      },
      { status: 500 }
    );
  }
}