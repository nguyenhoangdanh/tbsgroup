import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { z } from 'zod';


const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameVi: z.string().optional(),
  nameEn: z.string().optional(),
  nameId: z.string().optional(),
  description: z.string().optional(),
  descriptionVi: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionId: z.string().optional(),
  imageUrls: z.array(z.string().url()).default([]),
  slug: z.string().min(1, 'Slug is required'),
  price: z.number().positive().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  categoryId: z.string().min(1, 'Category is required'),
});

// GET - List all products
export async function GET(request: NextRequest) {
  try {
    

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const isFeatured = searchParams.get('isFeatured');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (isFeatured !== null) {
      where.isFeatured = isFeatured === 'true';
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        category: true
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: validatedData,
      include: {
        category: true
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}