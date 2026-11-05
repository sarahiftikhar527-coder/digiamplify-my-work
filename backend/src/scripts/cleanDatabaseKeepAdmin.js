import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma, connectDB } from "../config/db.js";

async function cleanDatabaseKeepAdmin() {
  await connectDB();

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@digiamplify.com").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "DigiAmplifySecureAdmin2026!";
  const adminName = process.env.ADMIN_NAME || "Super Admin";

  console.log(`🧹 Cleaning all dummy data from database...`);

  // 1. Delete dependent dummy data across all tables
  await prisma.progressReport.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.notificationPreference.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.finance.deleteMany({});
  await prisma.chat.deleteMany({});
  await prisma.calendar.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.leave.deleteMany({});
  await prisma.shiftAssignment.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.contactMessage.deleteMany({});
  await prisma.newsletterSubscriber.deleteMany({});

  // 2. Delete non-admin profiles & non-admin users
  await prisma.profile.deleteMany({
    where: {
      user: {
        email: { not: adminEmail },
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: { not: adminEmail },
    },
  });

  // 3. Upsert clean Admin account with verified password
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  let adminUser;
  if (existingAdmin) {
    adminUser = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        name: adminName,
        passwordHash,
        role: "admin",
        status: "active",
        isDeleted: false,
      },
    });
    console.log(`✅ Admin account updated successfully: ${adminEmail}`);
  } else {
    adminUser = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: "admin",
        status: "active",
        isDeleted: false,
      },
    });
    console.log(`✅ Admin account created successfully: ${adminEmail}`);
  }

  // Ensure Admin has a clean Profile
  const existingProfile = await prisma.profile.findUnique({
    where: { userId: adminUser.id },
  });

  if (!existingProfile) {
    await prisma.profile.create({
      data: {
        userId: adminUser.id,
        fullName: adminName,
        email: adminEmail,
        jobTitle: "Super Admin",
        department: "Management",
      },
    });
    console.log(`✅ Admin profile created`);
  }

  // 4. Verify password authentication match
  const isMatch = await bcrypt.compare(adminPassword, adminUser.passwordHash);
  if (!isMatch) {
    throw new Error("Password verification failed! Hash does not match.");
  }

  console.log(`\n🎉 DATABASE CLEANED & READY:`);
  console.log(`   Admin Email:    ${adminEmail}`);
  console.log(`   Admin Password: ${adminPassword}`);
  console.log(`   Role:           ${adminUser.role}`);
  console.log(`   Status:         ${adminUser.status}`);
  console.log(`   Auth Check:     PASS (Password Verified)\n`);
}

cleanDatabaseKeepAdmin()
  .catch((err) => {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

