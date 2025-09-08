import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create SuperAdmin user
  const superAdminEmail = process.env.SUPER_ADMIN_SEED_EMAIL || 'superadmin@tbs-handbag.com';
  const superAdminPassword = process.env.SUPER_ADMIN_SEED_PASSWORD || 'SuperAdminPass!456';
  const hashedSuperAdminPassword = await bcrypt.hash(superAdminPassword, 12);

  const superAdminUser = await prisma.adminUser.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      password: hashedSuperAdminPassword,
      role: 'SUPER_ADMIN',
      firstName: 'Super',
      lastName: 'Admin',
      status: 'ACTIVE',
    },
  });

  console.log('✅ SuperAdmin user created:', superAdminUser.email);

  // Create regular Admin user
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@tbs-handbag.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'SuperStrongPassword!123';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedAdminPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      status: 'ACTIVE',
      createdBy: superAdminUser.id,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create some sample inquiries for testing
  const sampleInquiries = [
    {
      email: 'customer1@example.com',
      content: 'I am interested in your Premium Urban Elegance collection. Could you provide more details about pricing and customization options?',
      imageUrls: [],
    },
    {
      email: 'customer2@example.com',
      content: 'We are looking for a sustainable handbag solution for our retail store. Can you help us with wholesale pricing?',
      imageUrls: [],
    },
  ];

  for (const inquiry of sampleInquiries) {
    await prisma.customerInquiry.create({
      data: inquiry,
    });
  }

  console.log('✅ Sample inquiries created');

  // Create sample categories with multilingual content
  const categories = [
    {
      name: {
        vi: 'Túi xách cao cấp',
        en: 'Premium Handbags',
        id: 'Tas Premium'
      },
      slug: 'premium-handbags',
      description: {
        vi: 'Bộ sưu tập túi xách cao cấp sang trọng với chất liệu da thật',
        en: 'Luxury premium handbag collection with genuine leather materials',
        id: 'Koleksi tas premium mewah dengan bahan kulit asli'
      },
      thumbnail: '/images/categories/premium-handbags.jpg',
      status: 'ACTIVE' as const,
      sortOrder: 1,
    },
    {
      name: {
        vi: 'Ví da',
        en: 'Leather Wallets',
        id: 'Dompet Kulit'
      },
      slug: 'leather-wallets',
      description: {
        vi: 'Ví da thật cao cấp với thiết kế tinh tế',
        en: 'Premium genuine leather wallets with sophisticated design',
        id: 'Dompet kulit asli premium dengan desain canggih'
      },
      thumbnail: '/images/categories/leather-wallets.jpg',
      status: 'ACTIVE' as const,
      sortOrder: 2,
    },
    {
      name: {
        vi: 'Túi du lịch',
        en: 'Travel Bags',
        id: 'Tas Perjalanan'
      },
      slug: 'travel-bags',
      description: {
        vi: 'Túi du lịch bền bỉ và tiện dụng cho mọi chuyến đi',
        en: 'Durable and functional travel bags for all your journeys',
        id: 'Tas perjalanan tahan lama dan fungsional untuk semua perjalanan Anda'
      },
      thumbnail: '/images/categories/travel-bags.jpg',
      status: 'ACTIVE' as const,
      sortOrder: 3,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('✅ Sample categories created');

  // Create sample products with multilingual content
  const sampleProducts = [
    {
      name: {
        vi: 'Túi xách Elegance',
        en: 'Elegance Handbag',
        id: 'Tas Elegance'
      },
      slug: 'elegance-handbag',
      description: {
        vi: 'Túi xách được làm từ da thật cao cấp, thiết kế sang trọng và tinh tế. Phù hợp cho các dịp quan trọng và công việc.',
        en: 'Handbag made from premium genuine leather with luxurious and sophisticated design. Perfect for important occasions and work.',
        id: 'Tas yang dibuat dari kulit asli premium dengan desain mewah dan canggih. Sempurna untuk acara penting dan kerja.'
      },
      shortDesc: {
        vi: 'Túi xách da thật cao cấp',
        en: 'Premium genuine leather handbag',
        id: 'Tas kulit asli premium'
      },
      price: 2500000,
      originalPrice: 3000000,
      images: ['/images/products/elegance-handbag-1.jpg', '/images/products/elegance-handbag-2.jpg'],
      specifications: {
        material: {
          vi: 'Da bò thật 100%',
          en: '100% Genuine Cowhide Leather',
          id: '100% Kulit Sapi Asli'
        },
        dimensions: {
          vi: '30cm x 25cm x 12cm',
          en: '30cm x 25cm x 12cm',
          id: '30cm x 25cm x 12cm'
        },
        weight: {
          vi: '0.8kg',
          en: '0.8kg',
          id: '0.8kg'
        }
      },
      categorySlug: 'premium-handbags',
      status: 'ACTIVE' as const,
      featured: true,
      sortOrder: 1,
      seoTitle: {
        vi: 'Túi xách Elegance - Da thật cao cấp | TBS Group',
        en: 'Elegance Handbag - Premium Leather | TBS Group',
        id: 'Tas Elegance - Kulit Premium | TBS Group'
      },
      seoDesc: {
        vi: 'Túi xách Elegance từ da thật cao cấp, thiết kế sang trọng. Mua ngay với giá ưu đãi tại TBS Group.',
        en: 'Elegance handbag in premium genuine leather with luxury design. Buy now at special price from TBS Group.',
        id: 'Tas Elegance dari kulit asli premium dengan desain mewah. Beli sekarang dengan harga khusus dari TBS Group.'
      }
    },
    {
      name: {
        vi: 'Ví da Executive',
        en: 'Executive Leather Wallet',
        id: 'Dompet Kulit Executive'
      },
      slug: 'executive-leather-wallet',
      description: {
        vi: 'Ví da dành cho doanh nhân với nhiều ngăn tiện lợi, chất liệu da cao cấp bền đẹp.',
        en: 'Leather wallet for executives with multiple convenient compartments, premium durable leather material.',
        id: 'Dompet kulit untuk eksekutif dengan berbagai kompartemen yang nyaman, bahan kulit premium yang tahan lama.'
      },
      shortDesc: {
        vi: 'Ví da doanh nhân cao cấp',
        en: 'Premium executive leather wallet',
        id: 'Dompet kulit eksekutif premium'
      },
      price: 850000,
      originalPrice: 1000000,
      images: ['/images/products/executive-wallet-1.jpg'],
      specifications: {
        material: {
          vi: 'Da bò Ý cao cấp',
          en: 'Premium Italian Leather',
          id: 'Kulit Italia Premium'
        },
        dimensions: {
          vi: '11cm x 9cm x 2cm',
          en: '11cm x 9cm x 2cm',
          id: '11cm x 9cm x 2cm'
        },
        compartments: {
          vi: '8 ngăn thẻ, 2 ngăn tiền',
          en: '8 card slots, 2 bill compartments',
          id: '8 slot kartu, 2 kompartemen uang'
        }
      },
      categorySlug: 'leather-wallets',
      status: 'ACTIVE' as const,
      featured: false,
      sortOrder: 2,
      seoTitle: {
        vi: 'Ví da Executive - Doanh nhân cao cấp | TBS Group',
        en: 'Executive Leather Wallet - Premium Business | TBS Group',
        id: 'Dompet Kulit Executive - Bisnis Premium | TBS Group'
      },
      seoDesc: {
        vi: 'Ví da Executive dành cho doanh nhân với thiết kế tinh tế, nhiều ngăn tiện lợi. Chất lượng cao cấp từ TBS Group.',
        en: 'Executive leather wallet for business professionals with sophisticated design and convenient compartments. Premium quality from TBS Group.',
        id: 'Dompet kulit Executive untuk profesional bisnis dengan desain canggih dan kompartemen yang nyaman. Kualitas premium dari TBS Group.'
      }
    },
    {
      name: {
        vi: 'Túi du lịch Explorer',
        en: 'Explorer Travel Bag',
        id: 'Tas Perjalanan Explorer'
      },
      slug: 'explorer-travel-bag',
      description: {
        vi: 'Túi du lịch chống nước với dung tích lớn, thiết kế thông minh cho những chuyến đi dài.',
        en: 'Water-resistant travel bag with large capacity and smart design for long journeys.',
        id: 'Tas perjalanan tahan air dengan kapasitas besar dan desain pintar untuk perjalanan panjang.'
      },
      shortDesc: {
        vi: 'Túi du lịch chống nước',
        en: 'Water-resistant travel bag',
        id: 'Tas perjalanan tahan air'
      },
      price: 1200000,
      images: ['/images/products/explorer-travel-bag-1.jpg', '/images/products/explorer-travel-bag-2.jpg'],
      specifications: {
        material: {
          vi: 'Vải Oxford chống nước',
          en: 'Water-resistant Oxford Fabric',
          id: 'Kain Oxford Tahan Air'
        },
        capacity: {
          vi: '45 lít',
          en: '45 liters',
          id: '45 liter'
        },
        dimensions: {
          vi: '55cm x 35cm x 25cm',
          en: '55cm x 35cm x 25cm',
          id: '55cm x 35cm x 25cm'
        }
      },
      categorySlug: 'travel-bags',
      status: 'ACTIVE' as const,
      featured: true,
      sortOrder: 3,
      seoTitle: {
        vi: 'Túi du lịch Explorer - Chống nước cao cấp | TBS Group',
        en: 'Explorer Travel Bag - Premium Water-resistant | TBS Group',
        id: 'Tas Perjalanan Explorer - Tahan Air Premium | TBS Group'
      },
      seoDesc: {
        vi: 'Túi du lịch Explorer chống nước, dung tích lớn 45L. Thiết kế thông minh cho mọi chuyến đi từ TBS Group.',
        en: 'Explorer travel bag water-resistant with large 45L capacity. Smart design for all journeys from TBS Group.',
        id: 'Tas perjalanan Explorer tahan air dengan kapasitas besar 45L. Desain pintar untuk semua perjalanan dari TBS Group.'
      }
    },
  ];

  for (const product of sampleProducts) {
    const category = await prisma.category.findUnique({
      where: { slug: product.categorySlug },
    });
    
    if (category) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDesc: product.shortDesc,
          price: product.price,
          originalPrice: product.originalPrice,
          images: product.images,
          specifications: product.specifications,
          categoryId: category.id,
          status: product.status,
          featured: product.featured,
          sortOrder: product.sortOrder,
          seoTitle: product.seoTitle,
          seoDesc: product.seoDesc,
        },
      });
    }
  }

  console.log('✅ Sample products created');
  console.log('🌱 Seeding completed!');
  
  // Display seed information
  console.log('\n📋 SEEDED ACCOUNTS:');
  console.log(`SuperAdmin: ${superAdminEmail} / ${superAdminPassword}`);
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
}
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });