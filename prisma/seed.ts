import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create SuperAdmin user
  const superAdminEmail = process.env.SUPER_ADMIN_SEED_EMAIL || 'admin@tbs-handbag.com';
  const superAdminPassword = process.env.SUPER_ADMIN_SEED_PASSWORD || 'ChangeThisStrongPwd!123';
  const hashedSuperAdminPassword = await bcrypt.hash(superAdminPassword, 12);

  const superAdminUser = await prisma.adminUser.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      password: hashedSuperAdminPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ SuperAdmin user created:', superAdminUser.email);

  // Create regular Admin user
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin2@tbs-handbag.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'AdminPassword123!';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedAdminPassword,
      role: 'ADMIN',
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

  // Create sample categories
  const categories = [
    {
      name: 'Túi xách cao cấp',
      slug: 'tui-xach-cao-cap',
      description: 'Bộ sưu tập túi xách cao cấp sang trọng',
      imageUrl: '/images/categories/luxury-handbags.jpg',
    },
    {
      name: 'Túi đeo chéo',
      slug: 'tui-deo-cheo',
      description: 'Túi đeo chéo tiện lợi và thời trang',
      imageUrl: '/images/categories/crossbody-bags.jpg',
    },
    {
      name: 'Túi clutch',
      slug: 'tui-clutch',
      description: 'Túi clutch thanh lịch cho dự tiệc',
      imageUrl: '/images/categories/clutch-bags.jpg',
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

  // Create sample products
  const sampleProducts = [
    {
      name: 'Túi xách da thật Premium',
      slug: 'tui-xach-da-that-premium',
      description: 'Túi xách được làm từ da thật cao cấp, thiết kế sang trọng',
      price: 2500000,
      imageUrls: ['/images/products/premium-leather-bag-1.jpg'],
      categorySlug: 'tui-xach-cao-cap',
    },
    {
      name: 'Túi đeo chéo Urban Style',
      slug: 'tui-deo-cheo-urban-style',
      description: 'Túi đeo chéo phong cách đô thị, phù hợp cho mọi hoạt động',
      price: 850000,
      imageUrls: ['/images/products/urban-crossbody-1.jpg'],
      categorySlug: 'tui-deo-cheo',
    },
    {
      name: 'Clutch Evening Elegance',
      slug: 'clutch-evening-elegance',
      description: 'Túi clutch thanh lịch cho những buổi tiệc tối',
      price: 1200000,
      imageUrls: ['/images/products/evening-clutch-1.jpg'],
      categorySlug: 'tui-clutch',
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
          price: product.price,
          imageUrls: product.imageUrls,
          categoryId: category.id,
        },
      });
    }
  }

  console.log('✅ Sample products created');

  // Create sample users
  const sampleUsers = [
    {
      email: 'customer1@example.com',
      name: 'Nguyễn Thị Hoa',
      phone: '0901234567',
      address: 'Hà Nội, Việt Nam',
    },
    {
      email: 'customer2@example.com',
      name: 'Trần Văn Nam',
      phone: '0907654321',
      address: 'TP. Hồ Chí Minh, Việt Nam',
    },
  ];

  for (const user of sampleUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log('✅ Sample users created');
  console.log('🌱 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });