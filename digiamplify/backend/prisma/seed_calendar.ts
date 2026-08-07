import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up duplicate tasks & seeding clean calendar data...');

  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.error('No users found in database');
    return;
  }

  const primaryUser = users.find(u => u.email === 'fahad@digiamplify.com') || users[0];

  // Clear existing seed tasks to avoid endless duplicates
  await prisma.task.deleteMany({
    where: {
      description: { in: ['Calendar seed task', 'Live calendar task from DB', 'Figma seed task for project proposal review'] }
    }
  });

  // Clean set of tasks per day for July & August 2026 (Max 2-3 per day)
  const taskTitles = [
    // July 2026 Tasks
    { month: '2026-07', day: '01', title: 'View Project Proposal' },
    { month: '2026-07', day: '04', title: 'View Project Proposal' },
    { month: '2026-07', day: '09', title: 'View Project Proposal' },
    { month: '2026-07', day: '13', title: 'View Project Proposal' },
    { month: '2026-07', day: '15', title: 'Review project proposal' },
    { month: '2026-07', day: '15', title: 'Dashboard Redesign' },
    { month: '2026-07', day: '15', title: 'UI/UX research' },
    { month: '2026-07', day: '16', title: 'View Project Proposal' },
    { month: '2026-07', day: '18', title: 'View Project Proposal' },
    { month: '2026-07', day: '26', title: 'View Project Proposal' },
    { month: '2026-07', day: '28', title: 'View Project Proposal' },

    // August 2026 Tasks (Current Month)
    { month: '2026-08', day: '01', title: 'View Project Proposal' },
    { month: '2026-08', day: '04', title: 'View Project Proposal' },
    { month: '2026-08', day: '07', title: 'Daily startup meeting' },
    { month: '2026-08', day: '07', title: 'Redesign dashboard' },
    { month: '2026-08', day: '07', title: 'Review project proposal' },
    { month: '2026-08', day: '10', title: 'View Project Proposal' },
    { month: '2026-08', day: '14', title: 'Independence Day Prep' },
    { month: '2026-08', day: '18', title: 'View Project Proposal' },
    { month: '2026-08', day: '20', title: 'Sprint Review' },
    { month: '2026-08', day: '25', title: 'View Project Proposal' }
  ];

  for (const u of users) {
    for (const t of taskTitles) {
      const dueDate = `${t.month}-${t.day}`;
      await prisma.task.create({
        data: {
          assignedToId: u.id,
          assignedById: primaryUser.id,
          subject: t.title,
          priority: 'HIGH',
          description: 'Live calendar task from DB',
          dueDate,
          status: 'PENDING'
        }
      });
    }
  }

  console.log('Successfully cleaned and seeded clean calendar tasks!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
