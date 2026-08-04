import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function runTest() {
  console.log('Running Integration Test for Add Employee...');

  // 1. Clean up potential old test user
  await prisma.profile.deleteMany({
    where: { email: 'test_emp@digiamplify.com' }
  });
  await prisma.user.deleteMany({
    where: { email: 'test_emp@digiamplify.com' }
  });
  console.log('Cleaned up previous test records.');

  // 2. Admin Login to get token
  console.log('Logging in as Admin...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@digiamplify.com',
      password: 'admin123'
    })
  });

  const loginData = (await loginRes.json()) as any;
  if (!loginRes.ok) {
    throw new Error(`Admin login failed: ${loginData.error}`);
  }
  const token = loginData.token;
  console.log('Logged in successfully as Admin.');

  // 3. Request Employee Creation
  console.log('Calling Add Employee endpoint...');
  const addRes = await fetch('http://localhost:5000/api/profile/add-employee', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Test Employee Name',
      email: 'test_emp@digiamplify.com',
      password: 'password123'
    })
  });

  const addData = (await addRes.json()) as any;
  if (!addRes.ok) {
    throw new Error(`Add employee request failed: ${addData.error}`);
  }
  console.log('Employee created successfully via API.');

  // 4. Verify in DB
  const dbUser = await prisma.user.findUnique({
    where: { email: 'test_emp@digiamplify.com' },
    include: { profile: true }
  });

  if (!dbUser) {
    throw new Error('User not found in DB after API call!');
  }
  console.log(`Verified DB entry: ID=${dbUser.id}, Name=${dbUser.profile?.fullName}, Status=${dbUser.status}`);

  // 5. Test logging in as the new Employee
  console.log('Logging in as newly created Employee...');
  const empLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test_emp@digiamplify.com',
      password: 'password123'
    })
  });

  const empLoginData = (await empLoginRes.json()) as any;
  if (!empLoginRes.ok) {
    throw new Error(`Employee login failed: ${empLoginData.error}`);
  }
  console.log(`Success! Logged in as Employee. Token: ${empLoginData.token.substring(0, 15)}...`);

  // Clean up
  await prisma.profile.deleteMany({
    where: { email: 'test_emp@digiamplify.com' }
  });
  await prisma.user.deleteMany({
    where: { email: 'test_emp@digiamplify.com' }
  });
  console.log('Test clean up completed. All tests passed!');
}

runTest()
  .catch((err) => {
    console.error('Integration Test FAILED:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
