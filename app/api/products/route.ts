import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { productFilterSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { 
      page, 
      pageSize, 
      search, 
      sort, 
      order, 
      categoryId, 
      featured, 
      minPrice, 
      maxPrice 
    } = productFilterSchema.parse({
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
      search: searchParams.get('search'),
      sort: searchParams.get('sort') || 'sortOrder',
      order: searchParams.get('order') || 'asc',
      categoryId: searchParams.get('categoryId'),
      featured: searchParams.get('featured'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
    });

    const skip = (page - 1) * pageSize;

    const where: any = {
      status: 'ACTIVE' // Only show active products to public
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

    const orderBy: any = [];
    
    // Always prioritize featured products first unless sorting by featured specifically
    if (sort !== 'name' && sort !== 'price') {
      orderBy.push({ featured: 'desc' });
    }
    
    if (sort === 'name') {
      orderBy.push({ name: { path: ['vi'], sort: order } });
    } else {
      orderBy.push({ [sort]: order });
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
          }
        },
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
          createdAt: true,
          category: true,
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
    console.error('Public products fetch error:', error);
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