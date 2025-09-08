const bcrypt = require('bcryptjs');

async function testHash() {
  const password = 'SuperAdminPass!456';
  
  // Test với salt round 12 như trong seed
  const hash12 = await bcrypt.hash(password, 12);
  console.log('Hash with salt 12:', hash12);
  
  // Test verify
  const isValid12 = await bcrypt.compare(password, hash12);
  console.log('Verify salt 12:', isValid12);
  
  // Test với salt round 10 (default)
  const hash10 = await bcrypt.hash(password, 10);
  console.log('Hash with salt 10:', hash10);
  
  // Test verify
  const isValid10 = await bcrypt.compare(password, hash10);
  console.log('Verify salt 10:', isValid10);
  
  // Test verify các password khác
  console.log('Test wrong password:', await bcrypt.compare('wrongpassword', hash12));
  console.log('Test empty password:', await bcrypt.compare('', hash12));
}

testHash().catch(console.error);