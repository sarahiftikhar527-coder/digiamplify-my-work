import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all transactions...');
  const result = await prisma.transaction.deleteMany({});
  console.log(`Successfully cleared ${result.count} transactions!`);
}

main()
  .catch((e) => {
    console.error('Error clearing transactions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
