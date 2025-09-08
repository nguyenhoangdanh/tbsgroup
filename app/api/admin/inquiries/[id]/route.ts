import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const inquiry = await prisma.customerInquiry.findUnique({
      where: { id: params.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });

    if (!inquiry) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Inquiry not found'
        }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: inquiry
    });

  } catch (error) {
    console.error('Inquiry fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch inquiry'
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
    const { status } = body;

    // Validate status
    const validStatuses = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid status value'
        }
      }, { status: 400 });
    }

    // Check if inquiry exists
    const existingInquiry = await prisma.customerInquiry.findUnique({
      where: { id: params.id }
    });

    if (!existingInquiry) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Inquiry not found'
        }
      }, { status: 404 });
    }

    // Update inquiry
    const updatedInquiry = await prisma.customerInquiry.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedInquiry
    });

  } catch (error) {
    console.error('Inquiry update error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update inquiry'
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

    // Check if inquiry exists
    const existingInquiry = await prisma.customerInquiry.findUnique({
      where: { id: params.id }
    });

    if (!existingInquiry) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Inquiry not found'
        }
      }, { status: 404 });
    }

    // Delete inquiry
    await prisma.customerInquiry.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted successfully'
    });

  } catch (error) {
    console.error('Inquiry deletion error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete inquiry'
        }
      },
      { status: 500 }
    );
  }
}