import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { adminUserSchema, paginationSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

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
    // Check SuperAdmin authorization (only SuperAdmin can manage admin users)
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

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters directly without schema validation to avoid null issues
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      prisma.adminUser.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: pageSize,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
        }
      }),
      prisma.adminUser.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
      },
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch admin users'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check SuperAdmin authorization
    const session = await getServerSession(authOptions);
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
    const validatedData = adminUserSchema.parse(body);

    if (!validatedData.password) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Password is required for new users'
          }
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'DUPLICATE_EMAIL',
            message: 'Admin user with this email already exists'
          }
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const user = await prisma.adminUser.create({
      data: {
        ...validatedData,
        password: hashedPassword,
        createdBy: session!.user.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Admin user created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Admin user creation error:', error);
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'DUPLICATE_EMAIL',
            message: 'Admin user with this email already exists'
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
          message: 'Failed to create admin user'
        }
      },
      { status: 500 }
    );
  }
}