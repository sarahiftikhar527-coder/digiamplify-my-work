import { prisma, connectDB } from '../config/db.js';
import { ROLES } from '../constants/roles.js';
import { hashPassword } from '../utils/password.js';

const email = 'admin@digiamplify.com';
const password = 'Admin@123';

async function createAdmin() {
  try {
    await connectDB();

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      if (existingUser.role === ROLES.ADMIN && !existingUser.isDeleted) {
        console.log('Admin account already exists.');
        console.log('Email:', email);
        return;
      }

      console.log('This email already belongs to an account. No changes made.');
      return;
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.create({
      data: {
        name: 'Admin',
        email,
        passwordHash,
        role: ROLES.ADMIN,
        status: 'active',
        isDeleted: false,
      },
    });

    console.log('Admin account created successfully.');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (error) {
    console.error('Unable to create admin:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
