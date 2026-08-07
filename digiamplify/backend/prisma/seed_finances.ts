import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding employee finance transactions & profiles...');

  let employees = await prisma.user.findMany({
    where: { role: 'Employee' },
    include: { profile: true }
  });

  if (employees.length === 0) {
    console.log('No employee users found. Creating sample employee users...');
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('Employee@123', salt);
    const defaultPin = await bcrypt.hash('1234', salt);

    const demoEmpsData = [
      { email: 'fahad@digiamplify.com', fullName: 'Fahad', jobTitle: 'Web Developer', department: 'Development', salary: '1234', bankName: 'Faysal Bank', accountNumber: '12345' },
      { email: 'sarah@digiamplify.com', fullName: 'Sarah Khan', jobTitle: 'UI/UX Designer', department: 'Design', salary: '1400', bankName: 'Standard Chartered', accountNumber: '98765' },
      { email: 'ali@digiamplify.com', fullName: 'Ali Raza', jobTitle: 'Frontend Engineer', department: 'Development', salary: '1600', bankName: 'HBL', accountNumber: '54321' },
      { email: 'hassan@digiamplify.com', fullName: 'Hassan Ahmed', jobTitle: 'Backend Engineer', department: 'Development', salary: '1800', bankName: 'Meezan Bank', accountNumber: '11223' },
      { email: 'ayesha@digiamplify.com', fullName: 'Ayesha Malik', jobTitle: 'QA Lead', department: 'Quality Assurance', salary: '1500', bankName: 'UBL', accountNumber: '33445' }
    ];

    for (const item of demoEmpsData) {
      const u = await prisma.user.create({
        data: {
          email: item.email,
          password: defaultPassword,
          role: 'Employee',
          pin: defaultPin,
          status: 'APPROVED'
        }
      });


      await prisma.profile.create({
        data: {
          userId: u.id,
          fullName: item.fullName,
          jobTitle: item.jobTitle,
          department: item.department,
          salary: item.salary,
          bankName: item.bankName,
          accountNumber: item.accountNumber,
          currency: 'USD',
          bonus: '123'
        }
      });
    }

    employees = await prisma.user.findMany({
      where: { role: 'Employee' },
      include: { profile: true }
    });
  }

  // Ensure all employees have bcrypt hashed PIN "1234"
  const salt = await bcrypt.genSalt(10);
  const hashedPin = await bcrypt.hash('1234', salt);
  await prisma.user.updateMany({
    where: { role: 'Employee' },
    data: { pin: hashedPin }
  });

  // Clear existing transactions to seed realistic ones

  await prisma.transaction.deleteMany({});

  const now = new Date();

  for (const emp of employees) {
    let salaryAmount = 1234.0;
    let bankName = emp.profile?.bankName || 'Faysal Bank';

    if (emp.profile && emp.profile.salary) {
      const parsed = parseFloat(emp.profile.salary.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) {
        salaryAmount = parsed;
      }
    }

    console.log(`Seeding transactions for employee: ${emp.email} (${salaryAmount})`);

    // Seed transactions for each of the 12 months
    for (let i = 0; i < 12; i++) {
      const transactionDate = new Date(now.getFullYear(), now.getMonth() - i, 1, 11, 30, 0);
      const refNum = Math.floor(10000 + Math.random() * 90000);

      // Monthly Salary
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

      // Bonus in specific months
      if (i % 2 === 0) {
        const bonusRef = Math.floor(10000 + Math.random() * 90000);
        const bonusAmount = 123.0;
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

      // Deduction in specific months
      if (i % 3 === 0) {
        const deductionRef = Math.floor(10000 + Math.random() * 90000);
        const deductionAmount = 12.0;
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
