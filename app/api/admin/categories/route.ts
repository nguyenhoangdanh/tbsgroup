import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { categorySchema, paginationSchema } from '@/lib/validations';

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
    // Check authentication
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
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { slug: { contains: search, mode: 'insensitive' } },
        { name: { path: ['vi'], string_contains: search } },
        { name: { path: ['en'], string_contains: search } },
        { name: { path: ['id'], string_contains: search } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    // Get total count
    const total = await prisma.category.count({ where });

    // Get categories with product count
    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: pageSize,
    });

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: categories,
      meta: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
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

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ 
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Super admin access required'
        }
      }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, description, thumbnail, status, sortOrder } = body;

    // Validate required fields
    if (!name?.vi || !name?.en || !name?.id || !slug) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name in all languages and slug are required'
        }
      }, { status: 400 });
    }

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'DUPLICATE_SLUG',
          message: 'A category with this slug already exists'
        }
      }, { status: 400 });
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        thumbnail: thumbnail || null,
        status: status || 'ACTIVE',
        sortOrder: sortOrder || 0,
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: category
    }, { status: 201 });

  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create category'
        }
      },
      { status: 500 }
    );
  }
}