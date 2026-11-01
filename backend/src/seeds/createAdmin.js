
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

async function createAdmin() {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env"
    );
  }

  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters long.");
  }

  await connectDB();

  const emailOwner = await User.findOne({ email });
  const existingAdmin = await User.findOne({ role: "admin" }).sort({
    createdAt: 1,
  });

  if (emailOwner && emailOwner.role !== "admin") {
    throw new Error(
      "This email belongs to a non-admin account. Choose another email."
    );
  }

  if (
    emailOwner &&
    existingAdmin &&
    String(emailOwner._id) !== String(existingAdmin._id)
  ) {
    throw new Error(
      "This email belongs to another admin account. Choose another email."
    );
  }

  const admin = existingAdmin || emailOwner;
  const passwordHash = await bcrypt.hash(password, 12);

  if (admin) {
    admin.name = name;
    admin.email = email;
    admin.passwordHash = passwordHash;
    admin.role = "admin";
    admin.status = "active";
    admin.isDeleted = false;

    await admin.save();

    console.log(`Admin account updated: ${email}`);
  } else {
    await User.create({
      name,
      email,
      passwordHash,
      role: "admin",
      status: "active",
      isDeleted: false,
    });

    console.log(`Admin account created: ${email}`);
  }
}

try {
  await createAdmin();
} catch (error) {
  console.error("Admin setup failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
