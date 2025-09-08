import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { 
        slug: params.slug,
        status: 'ACTIVE'
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
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

    // Get related products from the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        status: 'ACTIVE',
        id: { not: product.id } // Exclude current product
      },
      orderBy: [
        { featured: 'desc' },
        { sortOrder: 'asc' }
      ],
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        shortDesc: true,
        price: true,
        originalPrice: true,
        images: true,
        featured: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    });
  } catch (error) {
    console.error('Public product fetch error:', error);
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