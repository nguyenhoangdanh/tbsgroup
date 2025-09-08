const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Check all admin users
    const users = await prisma.adminUser.findMany();
    console.log('All admin users in database:', users);
    
    // Check specific user
    const superAdmin = await prisma.adminUser.findUnique({
      where: { email: 'superadmin@tbs-handbag.com' }
    });
    console.log('SuperAdmin user:', superAdmin);
    
    // Check tables exist
    const tableCheck = await prisma.$executeRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`;
    console.log('Tables in database:', tableCheck);
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();