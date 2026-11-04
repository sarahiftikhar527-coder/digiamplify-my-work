import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma, connectDB } from "../config/db.js";

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

  const emailOwner = await prisma.user.findUnique({ where: { email } });
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "admin" },
    orderBy: { createdAt: "asc" },
  });

  if (emailOwner && emailOwner.role !== "admin") {
    throw new Error(
      "This email belongs to a non-admin account. Choose another email."
    );
  }

  if (
    emailOwner &&
    existingAdmin &&
    emailOwner.id !== existingAdmin.id
  ) {
    throw new Error(
      "This email belongs to another admin account. Choose another email."
    );
  }

  const targetAdmin = existingAdmin || emailOwner;
  const passwordHash = await bcrypt.hash(password, 12);

  if (targetAdmin) {
    await prisma.user.update({
      where: { id: targetAdmin.id },
      data: {
        name,
        email,
        passwordHash,
        role: "admin",
        status: "active",
        isDeleted: false,
      },
    });

    console.log(`Admin account updated: ${email}`);
  } else {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "admin",
        status: "active",
        isDeleted: false,
      },
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
  await prisma.$disconnect().catch(() => {});
}
