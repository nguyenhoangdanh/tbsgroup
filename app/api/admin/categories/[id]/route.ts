import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { categoryUpdateSchema } from '@/lib/validations';

// Check if user is SuperAdmin
async function checkSuperAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return false;
  }
  return true;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            status: true,
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Category fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch category'
        }
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = categoryUpdateSchema.parse(body);

    // Check if the category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found'
          }
        },
        { status: 404 }
      );
    }

    // Check if slug already exists (if updating slug)
    if (validatedData.slug && validatedData.slug !== existingCategory.slug) {
      const categoryWithSlug = await prisma.category.findUnique({
        where: { slug: validatedData.slug },
      });

      if (categoryWithSlug) {
        return NextResponse.json(
          { 
            success: false,
            error: {
              code: 'DUPLICATE_SLUG',
              message: 'Category with this slug already exists'
            }
          },
          { status: 400 }
        );
      }
    }

    const { id, ...updateData } = validatedData;

    const category = await prisma.category.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Category update error:', error);
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
          code: 'UPDATE_ERROR',
          message: 'Failed to update category'
        }
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if the category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found'
          }
        },
        { status: 404 }
      );
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'HAS_PRODUCTS',
            message: 'Cannot delete category with existing products'
          }
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Category deletion error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete category'
        }
      },
      { status: 500 }
    );
  }
}