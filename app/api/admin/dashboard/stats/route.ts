import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Get dashboard statistics
    const [
      totalProducts,
      totalCategories,
      totalInquiries,
      totalUsers,
      recentInquiries
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.customerInquiry.count(),
      prisma.adminUser.count(),
      prisma.customerInquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }
        }
      })
    ]);

    // Get monthly inquiries for the last 12 months
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    
    const monthlyInquiries = await prisma.customerInquiry.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: twelveMonthsAgo
        }
      },
      _count: true
    });

    // Process monthly data
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = monthlyInquiries.filter(item => {
        const itemMonth = new Date(item.createdAt);
        return itemMonth.getMonth() === month.getMonth() && 
               itemMonth.getFullYear() === month.getFullYear();
      }).length;
      return count;
    }).reverse();

    // Get category distribution
    const categoryDistribution = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    const categoryData = categoryDistribution.map(cat => {
      let name = 'Unknown';
      if (cat.name && typeof cat.name === 'object' && !Array.isArray(cat.name)) {
        const nameObj = cat.name as Record<string, any>;
        name = nameObj.vi || nameObj.en || nameObj.id || 'Unknown';
      }
      return {
        name,
        count: cat._count.products,
        percentage: totalProducts > 0 ? Math.round((cat._count.products / totalProducts) * 100) : 0
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalCategories,
        totalInquiries,
        totalUsers,
        recentInquiries,
        monthlyInquiries: monthlyData,
        weeklyInquiries: monthlyData.slice(-4), // Last 4 weeks approximation
        categoryDistribution: categoryData,
        statusDistribution: [
          { status: 'ACTIVE', count: 0, percentage: 0 },
          { status: 'INACTIVE', count: 0, percentage: 0 },
          { status: 'DRAFT', count: 0, percentage: 0 }
        ],
        performanceMetrics: {
          averageResponseTime: 2.5,
          inquiryTrends: []
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch dashboard statistics'
        }
      },
      { status: 500 }
    );
  }
}