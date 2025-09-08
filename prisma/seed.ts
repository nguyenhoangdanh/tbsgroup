import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash the admin passwords
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@tbs-handbag.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';
  const hashedSuperAdminPassword = await bcrypt.hash(superAdminPassword, 12);

  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@tbs-handbag.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'ChangeThisStrongPwd!123';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Create super admin user
  const superAdminUser = await prisma.adminUser.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      password: hashedSuperAdminPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Super Admin user created:', superAdminUser.email);

  // Create admin user
  const adminUser = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create sample categories
  const categories = [
    {
      name: 'Premium Urban Elegance',
      nameVi: 'Premium Urban Elegance',
      nameEn: 'Premium Urban Elegance',
      nameId: 'Premium Urban Elegance',
      description: 'Dành cho người phụ nữ hiện đại, năng động với phong cách thanh lịch và tinh tế.',
      descriptionVi: 'Dành cho người phụ nữ hiện đại, năng động với phong cách thanh lịch và tinh tế.',
      descriptionEn: 'For modern, dynamic women with elegant and sophisticated style.',
      descriptionId: 'Untuk wanita modern dan dinamis dengan gaya elegan dan canggih.',
      slug: 'premium-urban-elegance',
      sortOrder: 1,
    },
    {
      name: 'Sustainable Heritage',
      nameVi: 'Sustainable Heritage',
      nameEn: 'Sustainable Heritage',
      nameId: 'Sustainable Heritage',
      description: 'Bộ sưu tập bền vững, thể hiện cam kết của chúng tôi với môi trường và tương lai.',
      descriptionVi: 'Bộ sưu tập bền vững, thể hiện cam kết của chúng tôi với môi trường và tương lai.',
      descriptionEn: 'Sustainable collection, showing our commitment to the environment and future.',
      descriptionId: 'Koleksi berkelanjutan, menunjukkan komitmen kami terhadap lingkungan dan masa depan.',
      slug: 'sustainable-heritage',
      sortOrder: 2,
    },
    {
      name: 'Seasonal Innovation',
      nameVi: 'Seasonal Innovation',
      nameEn: 'Seasonal Innovation',
      nameId: 'Seasonal Innovation',
      description: 'Những thiết kế mới nhất theo xu hướng thời trang từng mùa.',
      descriptionVi: 'Những thiết kế mới nhất theo xu hướng thời trang từng mùa.',
      descriptionEn: 'Latest designs following seasonal fashion trends.',
      descriptionId: 'Desain terbaru mengikuti tren fashion musiman.',
      slug: 'seasonal-innovation',
      sortOrder: 3,
    },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    createdCategories.push(createdCategory);
  }

  console.log('✅ Sample categories created');

  // Create sample products
  const products = [
    {
      name: 'Urban Classic Tote',
      nameVi: 'Túi Tote Urban Classic',
      nameEn: 'Urban Classic Tote',
      nameId: 'Urban Classic Tote',
      description: 'Túi tote sang trọng phù hợp cho cuộc sống đô thị hiện đại.',
      descriptionVi: 'Túi tote sang trọng phù hợp cho cuộc sống đô thị hiện đại.',
      descriptionEn: 'Elegant tote bag suitable for modern urban life.',
      descriptionId: 'Tas tote elegan yang cocok untuk kehidupan urban modern.',
      slug: 'urban-classic-tote',
      price: 850000,
      isFeatured: true,
      categoryId: createdCategories[0].id,
      imageUrls: [],
      sortOrder: 1,
    },
    {
      name: 'Eco-Friendly Shoulder Bag',
      nameVi: 'Túi Đeo Vai Thân Thiện Môi Trường',
      nameEn: 'Eco-Friendly Shoulder Bag',
      nameId: 'Eco-Friendly Shoulder Bag',
      description: 'Túi đeo vai được làm từ vật liệu tái chế, thân thiện với môi trường.',
      descriptionVi: 'Túi đeo vai được làm từ vật liệu tái chế, thân thiện với môi trường.',
      descriptionEn: 'Shoulder bag made from recycled materials, environmentally friendly.',
      descriptionId: 'Tas selempang yang dibuat dari bahan daur ulang, ramah lingkungan.',
      slug: 'eco-friendly-shoulder-bag',
      price: 720000,
      isFeatured: true,
      categoryId: createdCategories[1].id,
      imageUrls: [],
      sortOrder: 1,
    },
    {
      name: 'Seasonal Crossbody',
      nameVi: 'Túi Đeo Chéo Theo Mùa',
      nameEn: 'Seasonal Crossbody',
      nameId: 'Seasonal Crossbody',
      description: 'Túi đeo chéo với thiết kế theo xu hướng mùa.',
      descriptionVi: 'Túi đeo chéo với thiết kế theo xu hướng mùa.',
      descriptionEn: 'Crossbody bag with seasonal trend design.',
      descriptionId: 'Tas selempang dengan desain tren musiman.',
      slug: 'seasonal-crossbody',
      price: 650000,
      categoryId: createdCategories[2].id,
      imageUrls: [],
      sortOrder: 1,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log('✅ Sample products created');

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