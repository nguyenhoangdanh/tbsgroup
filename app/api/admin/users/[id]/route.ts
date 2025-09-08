import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { adminUserUpdateSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

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

    const user = await prisma.adminUser.findUnique({
      where: { id: params.id },
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

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Admin user not found'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Admin user fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch admin user'
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
    const validatedData = adminUserUpdateSchema.parse(body);

    // Check if the user exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Admin user not found'
          }
        },
        { status: 404 }
      );
    }

    // Prevent SuperAdmin from deleting themselves
    if (existingUser.id === session!.user.id && validatedData.status === 'INACTIVE') {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'SELF_DEACTIVATION',
            message: 'Cannot deactivate your own account'
          }
        },
        { status: 400 }
      );
    }

    // Check if email already exists (if updating email)
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const userWithEmail = await prisma.adminUser.findUnique({
        where: { email: validatedData.email },
      });

      if (userWithEmail) {
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
    }

    const { id, password, ...updateData } = validatedData;

    // Hash password if provided
    if (password) {
      (updateData as any).password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.adminUser.update({
      where: { id: params.id },
      data: updateData,
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
      message: 'Admin user updated successfully'
    });
  } catch (error) {
    console.error('Admin user update error:', error);
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
          message: 'Failed to update admin user'
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

    // Check if the user exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Admin user not found'
          }
        },
        { status: 404 }
      );
    }

    // Prevent SuperAdmin from deleting themselves
    if (existingUser.id === session!.user.id) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'SELF_DELETION',
            message: 'Cannot delete your own account'
          }
        },
        { status: 400 }
      );
    }

    await prisma.adminUser.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user deleted successfully'
    });
  } catch (error) {
    console.error('Admin user deletion error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete admin user'
        }
      },
      { status: 500 }
    );
  }
}