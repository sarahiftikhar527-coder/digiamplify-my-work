import { prisma, connectDB } from "../config/db.js";
import { hashPassword } from "../utils/password.js";

const ADMIN = {
  name: "Admin",
  email: "admin@company.com",
  password: "Admin@12345",
  role: "admin",
};

const EMPLOYEES = [
  { name: "Ahmed Khan", email: "ahmed@company.com", department: "Design" },
  { name: "Sara Ali", email: "sara@company.com", department: "HR" },
  { name: "Usman Tariq", email: "usman@company.com", department: "Development" },
].map((e) => ({ ...e, password: "Employee@12345", role: "employee" }));

async function upsertUser({ password, ...data }) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      ...data,
      passwordHash: await hashPassword(password),
    },
  });
}

async function run() {
  await connectDB();

  const admin = await upsertUser(ADMIN);
  const employees = [];
  for (const e of EMPLOYEES) {
    employees.push(await upsertUser(e));
  }

  const notificationCount = await prisma.notification.count();
  if (notificationCount === 0) {
    await prisma.notification.createMany({
      data: [
        {
          toId: admin.id,
          type: "leave",
          tag: "HR & Admin",
          title: "Leave request received",
          message: "Sara Ali has requested leave for 2 days.",
          details: "Sara Ali has requested leave for 2 days. Please approve or reject the request.",
        },
        {
          toId: employees[0].id,
          fromId: admin.id,
          type: "task",
          tag: "Tasks",
          title: "Task assigned",
          message: "You have been assigned a new task: Design Homepage UI.",
          details: "Task: Design Homepage UI. Priority: High. Please update the status once you start.",
          link: "/task",
          linkLabel: "Open Tasks",
        },
      ],
    });
  }

  console.log("\nSeed done. Login details:");
  console.log(`  Admin    : ${ADMIN.email} / ${ADMIN.password}`);
  console.log("  Employee : ahmed@company.com, sara@company.com, usman@company.com / Employee@12345\n");

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
