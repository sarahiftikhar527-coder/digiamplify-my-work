import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding employee finance transactions...');

  const employees = await prisma.user.findMany({
    where: { role: 'Employee' },
    include: { profile: true }
  });

  if (employees.length === 0) {
    console.log('No employee users found. Please register or seed employees first.');
    return;
  }

  // Clear existing transactions to avoid duplicate seeding issues
  await prisma.transaction.deleteMany({});

  const now = new Date();

  for (const emp of employees) {
    let salaryAmount = 4500.0;
    let bankName = 'Faysal Bank';
    let accountNo = '1234567890';

    if (emp.profile) {
      if (emp.profile.salary) {
        const parsed = parseFloat(emp.profile.salary.replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed)) {
          salaryAmount = parsed;
        }
      }
      if (emp.profile.bankName) {
        bankName = emp.profile.bankName;
      }
      if (emp.profile.accountNumber) {
        accountNo = emp.profile.accountNumber;
      }
    } else {
      // Create a default profile if missing
      await prisma.profile.create({
        data: {
          userId: emp.id,
          fullName: 'Test User',
          salary: '4500',
          bankName: 'Faysal Bank',
          accountNumber: '1234567890',
          currency: 'USD',
          shift: 'Day'
        }
      });
    }

    console.log(`Seeding transactions for employee: ${emp.email} with base salary: ${salaryAmount}`);

    // Seed salary for each of the last 12 months
    for (let i = 0; i < 12; i++) {
      const transactionDate = new Date(now.getFullYear(), now.getMonth() - i, 1, 11, 30, 0);
      const refNum = Math.floor(10000 + Math.random() * 90000);

      // 1. Monthly Salary
      await prisma.transaction.create({
        data: {
          userId: emp.id,
          title: `${bankName} Salary Transfer`,
          reference: `#${refNum}`,
          amount: salaryAmount,
          type: 'SALARY',
          date: transactionDate,
          status: 'SUCCESSFUL'
        }
      });

      // 2. Add some random bonuses
      if (i === 0 || i === 2 || i === 5 || i === 8 || i === 10) {
        const bonusRef = Math.floor(10000 + Math.random() * 90000);
        const bonusAmount = 250.0 + (i * 20); // varied amounts
        const bonusDate = new Date(now.getFullYear(), now.getMonth() - i, 10, 14, 0, 0);

        await prisma.transaction.create({
          data: {
            userId: emp.id,
            title: 'Performance Bonus',
            reference: `#${bonusRef}`,
            amount: bonusAmount,
            type: 'BONUS',
            date: bonusDate,
            status: 'SUCCESSFUL'
          }
        });
      }

      // 3. Add some random deductions
      if (i === 1 || i === 3 || i === 6 || i === 11) {
        const deductionRef = Math.floor(10000 + Math.random() * 90000);
        const deductionAmount = 120.0;
        const deductionDate = new Date(now.getFullYear(), now.getMonth() - i, 15, 10, 0, 0);

        await prisma.transaction.create({
          data: {
            userId: emp.id,
            title: 'Absence Deduction',
            reference: `#${deductionRef}`,
            amount: deductionAmount,
            type: 'DEDUCTION',
            date: deductionDate,
            status: 'SUCCESSFUL'
          }
        });
      }
    }
  }

  console.log('Successfully seeded all employee finance transactions!');
}

main()
  .catch((e) => {
    console.error('Error during finance seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
