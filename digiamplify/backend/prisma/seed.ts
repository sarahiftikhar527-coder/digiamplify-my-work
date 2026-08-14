import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Starting full database reset and seeding process...');

  // 1. CLEAN RESET: Delete all data from all tables in reverse foreign key dependency order
  console.log('1. Clearing existing database records...');
  await prisma.break.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.taskActivity.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.taskRequest.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.calendarEvent.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.participant.deleteMany({});
  await prisma.chatRoom.deleteMany({});
  await prisma.groupRequest.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Database successfully reset to 0 records.');

  // Hashing default credentials
  const salt = await bcrypt.genSalt(10);
  const defaultEmployeePassword = await bcrypt.hash('Employee@123', salt);
  const defaultAdminPassword = await bcrypt.hash('admin123', salt);
  const defaultPin = await bcrypt.hash('1234', salt);

  // 2. SEED ADMIN USER
  console.log('2. Seeding Admin User...');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@digiamplify.com';
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      password: defaultAdminPassword,
      role: 'Admin',
      pin: '',
      status: 'APPROVED',
      isOnline: true,
      profile: {
        create: {
          fullName: 'System Admin',
          userName: 'admin',
          email: adminEmail,
          workEmail: adminEmail,
          jobTitle: 'System Administrator',
          department: 'Management',
          phone: '+1 800-555-0199',
          country: 'United States',
          city: 'New York',
          salary: '5000',
          currency: 'USD',
          bankName: 'Federal Reserve Bank',
          accountNumber: '9999000011'
        }
      }
    },
    include: { profile: true }
  });
  console.log(`Admin user created: ${adminUser.email}`);

  // 3. SEED 5 EMPLOYEES
  console.log('3. Seeding 5 Employees...');
  const employeeDefs = [
    {
      email: 'fahad@digiamplify.com',
      fullName: 'Fahad Ahmad',
      userName: 'fahad',
      jobTitle: 'Senior Web Developer',
      department: 'Development',
      salary: '2500',
      bankName: 'Faysal Bank',
      accountNumber: '1234567890',
      phone: '+92 300 1234567',
      city: 'Lahore',
      country: 'Pakistan',
      jobType: 'Full-Time',
      workType: 'Remote',
      shift: 'Morning (09:00 AM - 05:00 PM)',
      dateOfJoining: '2024-01-15'
    },
    {
      email: 'sarah@digiamplify.com',
      fullName: 'Sarah Khan',
      userName: 'sarah',
      jobTitle: 'UI/UX Lead Designer',
      department: 'Design',
      salary: '2400',
      bankName: 'Standard Chartered',
      accountNumber: '9876543210',
      phone: '+92 301 9876543',
      city: 'Karachi',
      country: 'Pakistan',
      jobType: 'Full-Time',
      workType: 'Hybrid',
      shift: 'Morning (09:00 AM - 05:00 PM)',
      dateOfJoining: '2024-02-01'
    },
    {
      email: 'ali@digiamplify.com',
      fullName: 'Ali Raza',
      userName: 'ali',
      jobTitle: 'Frontend Engineer',
      department: 'Development',
      salary: '2200',
      bankName: 'HBL',
      accountNumber: '5432167890',
      phone: '+92 302 5432167',
      city: 'Islamabad',
      country: 'Pakistan',
      jobType: 'Full-Time',
      workType: 'On-Site',
      shift: 'Morning (09:00 AM - 05:00 PM)',
      dateOfJoining: '2024-03-10'
    },
    {
      email: 'hassan@digiamplify.com',
      fullName: 'Hassan Ahmed',
      userName: 'hassan',
      jobTitle: 'Backend Engineer',
      department: 'Development',
      salary: '2600',
      bankName: 'Meezan Bank',
      accountNumber: '1122334455',
      phone: '+92 303 1122334',
      city: 'Lahore',
      country: 'Pakistan',
      jobType: 'Full-Time',
      workType: 'Remote',
      shift: 'Morning (09:00 AM - 05:00 PM)',
      dateOfJoining: '2024-01-20'
    },
    {
      email: 'ayesha@digiamplify.com',
      fullName: 'Ayesha Malik',
      userName: 'ayesha',
      jobTitle: 'QA Lead',
      department: 'Quality Assurance',
      salary: '2100',
      bankName: 'UBL',
      accountNumber: '3344556677',
      phone: '+92 304 3344556',
      city: 'Rawalpindi',
      country: 'Pakistan',
      jobType: 'Full-Time',
      workType: 'On-Site',
      shift: 'Morning (09:00 AM - 05:00 PM)',
      dateOfJoining: '2024-04-05'
    }
  ];

  const employees: any[] = [];
  for (const empData of employeeDefs) {
    const createdEmp = await prisma.user.create({
      data: {
        email: empData.email,
        password: defaultEmployeePassword,
        role: 'Employee',
        pin: defaultPin,
        status: 'APPROVED',
        isOnline: true,
        profile: {
          create: {
            fullName: empData.fullName,
            userName: empData.userName,
            email: empData.email,
            workEmail: empData.email,
            jobTitle: empData.jobTitle,
            department: empData.department,
            salary: empData.salary,
            currency: 'USD',
            bonus: '150',
            ...({ taxRate: '10', taxId: 'TAX-8839201' } as any),
            bankName: empData.bankName,
            accountNumber: empData.accountNumber,
            phone: empData.phone,
            city: empData.city,
            country: empData.country,
            jobType: empData.jobType,
            workType: empData.workType,
            shift: empData.shift,
            dateOfJoining: empData.dateOfJoining,
            annualLeave: '14'
          }
        }
      },
      include: { profile: true }
    });
    employees.push(createdEmp);
    console.log(`Created employee: ${createdEmp.profile?.fullName} (${createdEmp.email})`);
  }

  // 4. MODULE SEEDING FOR EACH EMPLOYEE

  // Current reference date: 2026-08-14
  const todayStr = '2026-08-14';

  for (const emp of employees) {
    const empId = emp.id;
    const empName = emp.profile?.fullName || emp.email;

    console.log(`\nSeeding module data for ${empName}...`);

    // A. TASKS
    const tasksData = [
      {
        subject: 'Setup CI/CD Pipeline & Deployment Script',
        priority: 'HIGH',
        description: 'Configure GitHub Actions workflows and automated release deployment scripts.',
        dueDate: '2026-08-01',
        dueTime: '10:00 AM',
        status: 'COMPLETED',
        progress: 100
      },
      {
        subject: 'Database Schema Optimization & Indexing',
        priority: 'MEDIUM',
        description: 'Optimize Prisma query indexes and audit MySQL foreign key performance.',
        dueDate: '2026-08-08',
        dueTime: '02:30 PM',
        status: 'COMPLETED',
        progress: 100
      },
      {
        subject: 'Portal Dashboard Widget & Live Analytics',
        priority: 'HIGH',
        description: 'Implement real-time stat cards, dynamic gauges, and activity charts on dashboard.',
        dueDate: todayStr,
        dueTime: '05:00 PM',
        status: 'IN_PROGRESS',
        progress: 65
      },
      {
        subject: 'API Security Audit & JWT Middleware Review',
        priority: 'HIGH',
        description: 'Audit authentication endpoints and ensure proper Bearer token headers validation.',
        dueDate: '2026-08-10', // Overdue
        dueTime: '11:00 AM',
        status: 'PENDING',
        progress: 15
      },
      {
        subject: 'Q3 Product Roadmap & Sprint Planning',
        priority: 'LOW',
        description: 'Review story points and upcoming sprint requirements with project manager.',
        dueDate: '2026-08-22', // Upcoming
        dueTime: '03:00 PM',
        status: 'PENDING',
        progress: 0
      }
    ];

    for (const t of tasksData) {
      const createdTask = await prisma.task.create({
        data: {
          assignedToId: empId,
          assignedById: adminUser.id,
          subject: t.subject,
          priority: t.priority,
          description: t.description,
          dueDate: t.dueDate,
          dueTime: t.dueTime,
          status: t.status,
          progress: t.progress
        }
      });

      await prisma.taskActivity.create({
        data: {
          taskId: createdTask.id,
          userId: adminUser.id,
          description: `Task "${t.subject}" assigned by Admin to ${empName}`
        }
      });

      if (t.status === 'COMPLETED') {
        await prisma.taskActivity.create({
          data: {
            taskId: createdTask.id,
            userId: empId,
            description: `Task marked as COMPLETED by ${empName}`
          }
        });
      }
    }

    // B. TASK REQUESTS
    await prisma.taskRequest.create({
      data: {
        assignedToId: empId,
        assignedById: empId,
        subject: 'Request for Module Refactoring',
        priority: 'MEDIUM',
        description: 'Proposed refactoring of client-side state handling to improve response latency.',
        dueDate: '2026-08-18',
        dueTime: '04:00 PM',
        status: 'PENDING'
      }
    });

    await prisma.taskRequest.create({
      data: {
        assignedToId: empId,
        assignedById: empId,
        subject: 'Request for New Component Library Integration',
        priority: 'LOW',
        description: 'Integrate updated chart components for financial reports.',
        dueDate: '2026-08-12',
        dueTime: '02:00 PM',
        status: 'APPROVED'
      }
    });

    // C. ATTENDANCE & BREAKS (Past 14 days up to 2026-08-14)
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const d = new Date(2026, 7, 14 - dayOffset); // August = month 7 (0-indexed)
      const dayNum = d.getDay();
      if (dayNum === 0 || dayNum === 6) continue; // Skip weekends

      const dateIsoStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const isLate = dayOffset % 4 === 1;
      const clockInHour = isLate ? 9 : 8;
      const clockInMin = isLate ? 35 : 55;

      const clockInDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), clockInHour, clockInMin, 0);
      const clockOutDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 17, 0, 0);

      const attendance = await prisma.attendance.create({
        data: {
          userId: empId,
          date: dateIsoStr,
          clockIn: clockInDate,
          clockOut: clockOutDate,
          status: isLate ? 'LATE' : 'CLOCKED_OUT',
          lateDuration: isLate ? '35m' : null,
          description: isLate ? 'Traffic delay on transit' : 'Regular workday attendance'
        }
      });

      // Add a break
      const breakStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 13, 0, 0);
      const breakEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 13, 45, 0);
      await prisma.break.create({
        data: {
          attendanceId: attendance.id,
          startTime: breakStart,
          endTime: breakEnd
        }
      });
    }

    // D. LEAVE REQUESTS
    await prisma.leaveRequest.create({
      data: {
        userId: empId,
        leaveType: 'Annual Leave',
        startDate: '2026-07-15',
        endDate: '2026-07-20',
        reason: 'Family vacation and personal downtime.',
        status: 'APPROVED'
      }
    });

    await prisma.leaveRequest.create({
      data: {
        userId: empId,
        leaveType: 'Sick Leave',
        startDate: '2026-08-04',
        endDate: '2026-08-05',
        reason: 'Flu and fever recovery.',
        status: 'UNAPPROVED'
      }
    });

    await prisma.leaveRequest.create({
      data: {
        userId: empId,
        leaveType: 'Casual Leave',
        startDate: '2026-08-25',
        endDate: '2026-08-26',
        reason: 'Personal administrative work.',
        status: 'PENDING'
      }
    });

    // E. CALENDAR EVENTS
    const eventsData = [
      { title: 'Daily Startup Sync', date: todayStr, startTime: '09:00 AM', endTime: '09:30 AM', eventType: 'EVENT', location: 'Meeting Room 1' },
      { title: 'Project Proposal Review', date: todayStr, startTime: '02:00 PM', endTime: '03:00 PM', eventType: 'TASK_VIEW', location: 'Conference Hall B' },
      { title: 'Sprint Retrospective', date: '2026-08-20', startTime: '04:00 PM', endTime: '05:00 PM', eventType: 'EVENT', location: 'Virtual Google Meet' },
      { title: 'Independence Day Holiday', date: '2026-08-14', startTime: '09:00 AM', endTime: '05:00 PM', eventType: 'HOLIDAY', location: 'Office Closed' }
    ];

    for (const ev of eventsData) {
      await prisma.calendarEvent.create({
        data: {
          userId: empId,
          title: ev.title,
          date: ev.date,
          startTime: ev.startTime,
          endTime: ev.endTime,
          eventType: ev.eventType,
          location: ev.location,
          attendeesCount: 5,
          description: `Scheduled event: ${ev.title}`
        }
      });
    }

    // F. SUPPORT TICKETS
    await prisma.supportTicket.create({
      data: {
        userId: empId,
        issueType: 'IT Support',
        subject: 'VPN Connection Credentials Issue',
        priority: 'High',
        description: 'Unable to authenticate into remote VPN gateway after credential update.',
        status: 'RESOLVED',
        contactMethod: 'Email',
        adminResponse: 'VPN configuration profile regenerated and sent via email.',
        respondedAt: new Date()
      }
    });

    await prisma.supportTicket.create({
      data: {
        userId: empId,
        issueType: 'HR / Finance',
        subject: 'Monthly Allowance Calculation Query',
        priority: 'Medium',
        description: 'Requesting confirmation regarding internet allowance inclusion in salary transfer.',
        status: 'PENDING',
        contactMethod: 'In-App'
      }
    });

    // G. FINANCE & TRANSACTIONS (12 months of salary/bonus/deduction history)
    const empSalary = parseFloat(emp.profile?.salary || '2500');
    const bankName = emp.profile?.bankName || 'Faysal Bank';

    for (let i = 0; i < 12; i++) {
      const transDate = new Date(2026, 7 - i, 1, 11, 30, 0);
      const refCode = Math.floor(100000 + Math.random() * 900000);

      // Official Monthly Salary Disbursement Transaction
      await prisma.transaction.create({
        data: {
          userId: empId,
          title: `Monthly Salary Disbursement`,
          reference: `#SAL-${refCode}`,
          amount: empSalary,
          type: 'SALARY',
          date: transDate,
          status: 'SUCCESSFUL'
        }
      });
    }
  }

  // H. CHAT ROOMS & MESSAGES
  console.log('\nSeeding Chat Rooms & Messages...');

  // 1 General Company Group Chat
  const groupChat = await prisma.chatRoom.create({
    data: {
      name: 'General Company Announcements',
      isGroup: true,
      description: 'Official group chat for all team members and administration.',
      participants: {
        create: [
          { userId: adminUser.id, role: 'ADMIN' },
          ...employees.map((e) => ({ userId: e.id, role: 'MEMBER' }))
        ]
      }
    }
  });

  await prisma.message.create({
    data: {
      chatRoomId: groupChat.id,
      senderId: adminUser.id,
      content: 'Welcome everyone to the updated DigiAmplify Portal!',
      isSystem: false
    }
  });

  await prisma.message.create({
    data: {
      chatRoomId: groupChat.id,
      senderId: employees[0].id,
      content: 'Thank you Admin! All dashboard metrics and modules are updated.',
      isSystem: false
    }
  });

  // Direct message chats between Admin and each Employee
  for (const emp of employees) {
    const dmRoom = await prisma.chatRoom.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: adminUser.id, role: 'ADMIN' },
            { userId: emp.id, role: 'MEMBER' }
          ]
        }
      }
    });

    await prisma.message.create({
      data: {
        chatRoomId: dmRoom.id,
        senderId: adminUser.id,
        content: `Hello ${emp.profile?.fullName}, please review your updated tasks and attendance logs.`
      }
    });

    await prisma.message.create({
      data: {
        chatRoomId: dmRoom.id,
        senderId: emp.id,
        content: 'Understood, reviewing now!'
      }
    });
  }

  console.log('\n========================================');
  console.log('SEEDING COMPLETED SUCCESSFULLY!');
  console.log('Summary of Seeded Data:');
  console.log(`- 1 Admin: ${adminUser.email} (Password: admin123)`);
  console.log(`- 5 Employees (Password: Employee@123, PIN: 1234):`);
  employees.forEach((e) => console.log(`   * ${e.profile?.fullName} (${e.email})`));
  console.log('- Complete tasks, requests, attendance, leaves, calendar, support, finance & chat seeded!');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
