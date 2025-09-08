import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { 
        slug: params.slug,
        status: 'ACTIVE'
      },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          orderBy: [
            { featured: 'desc' },
            { sortOrder: 'asc' },
            { createdAt: 'desc' }
          ],
          select: {
            id: true,
            name: true,
            slug: true,
            shortDesc: true,
            price: true,
            originalPrice: true,
            images: true,
            featured: true,
            seoTitle: true,
            seoDesc: true,
          }
        },
        _count: {
          select: { 
            products: {
              where: { status: 'ACTIVE' }
            }
          }
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
    console.error('Public category fetch error:', error);
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