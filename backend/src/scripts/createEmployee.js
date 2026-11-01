
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import { ROLES } from '../constants/roles.js';
import { hashPassword } from '../utils/password.js';

const email = 'employee@digiamplify.com';
const password = 'Employee@123';

async function createEmployee() {
  try {
    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('This email already exists. No changes made.');
      return;
    }

    const passwordHash = await hashPassword(password);

    await User.create({
      name: 'Ahmed Khan',
      email,
      passwordHash,
      role: ROLES.EMPLOYEE,
      status: 'active',
      isDeleted: false,
      department: 'General',
      designation: 'Employee',
    });

    console.log('Employee account created successfully.');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (error) {
    console.error('Unable to create employee:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createEmployee();
