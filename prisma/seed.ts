import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash the admin password
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@tbs-handbag.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'ChangeThisStrongPwd!123';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Create admin user
  const adminUser = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
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