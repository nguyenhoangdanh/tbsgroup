const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    const email = 'superadmin@tbs-handbag.com';
    const password = 'SuperAdminPass!456';
    
    console.log('Testing auth logic with same credentials...');
    console.log('Email:', email);
    console.log('Password:', password);
    
    // Test exact same query as in auth.ts
    console.log('\n1. Testing without status filter:');
    const userCheck = await prisma.adminUser.findUnique({
      where: { email: email }
    });
    console.log('User found:', userCheck ? 'YES' : 'NO');
    if (userCheck) {
      console.log('User details:', {
        id: userCheck.id,
        email: userCheck.email,
        role: userCheck.role,
        status: userCheck.status
      });
    }
    
    console.log('\n2. Testing WITH status filter (like in auth.ts):');
    const user = await prisma.adminUser.findUnique({
      where: { 
        email: email,
        status: 'ACTIVE'
      }
    });
    console.log('User found with status filter:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User details:', {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      });
      
      console.log('\n3. Testing password verification:');
      console.log('Stored hash:', user.password);
      console.log('Hash length:', user.password.length);
      
      const isValid = await bcrypt.compare(password, user.password);
      console.log('Password valid:', isValid);
      
      // Test with wrong password
      const isInvalid = await bcrypt.compare('wrongpassword', user.password);
      console.log('Wrong password test (should be false):', isInvalid);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();