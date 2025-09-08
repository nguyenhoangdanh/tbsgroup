import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productUpdateSchema } from '@/lib/validations';

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

    const product = await prisma.product.findUnique({
      where: { id: params.id },
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

    if (!product) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch product'
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
    const validatedData = productUpdateSchema.parse(body);

    // Check if the product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found'
          }
        },
        { status: 404 }
      );
    }

    // Check if slug already exists (if updating slug)
    if (validatedData.slug && validatedData.slug !== existingProduct.slug) {
      const productWithSlug = await prisma.product.findUnique({
        where: { slug: validatedData.slug },
      });

      if (productWithSlug) {
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
    }

    // Check if category exists (if updating category)
    if (validatedData.categoryId) {
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
    }

    const { id, ...updateData } = validatedData;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
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
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Product update error:', error);
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
          message: 'Failed to update product'
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

    // Check if the product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { inquiries: true }
        }
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found'
          }
        },
        { status: 404 }
      );
    }

    // Check if product has inquiries
    if (existingProduct._count.inquiries > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'HAS_INQUIRIES',
            message: 'Cannot delete product with existing inquiries'
          }
        },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete product'
        }
      },
      { status: 500 }
    );
  }
}