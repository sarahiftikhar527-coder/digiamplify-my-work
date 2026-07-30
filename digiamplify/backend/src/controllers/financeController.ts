import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getEmployeeFinanceData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized user context' });
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthlySalaryAmount = 0;
    if (profile && profile.salary) {
      monthlySalaryAmount = parseFloat(profile.salary.replace(/[^0-9.]/g, '')) || 0;
    }

    let thisMonthBonus = 0;
    if (profile && profile.bonus && profile.bonus.trim().length > 0) {
      const parsedBonus = parseFloat(profile.bonus.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsedBonus)) {
        thisMonthBonus = parsedBonus;
      }
    }

    // If profile bonus is not set, fallback to transaction bonuses for the current month
    if (thisMonthBonus === 0) {
      transactions.forEach((tx) => {
        const txDate = new Date(tx.date);
        const isCurrentMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
        if (tx.status.toUpperCase() === 'SUCCESSFUL' && tx.type === 'BONUS' && isCurrentMonth) {
          thisMonthBonus += tx.amount;
        }
      });
    }

    let thisMonthDeduction = 0;
    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      const isCurrentMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      if (tx.status.toUpperCase() === 'SUCCESSFUL' && tx.type === 'DEDUCTION' && isCurrentMonth) {
        thisMonthDeduction += tx.amount;
      }
    });

    const netSalaryAmount = monthlySalaryAmount + thisMonthBonus - thisMonthDeduction;

    const monthlyEarnings = Array(12).fill(0);
    const monthlyBonuses = Array(12).fill(0);

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (txDate.getFullYear() === currentYear && tx.status.toUpperCase() === 'SUCCESSFUL') {
        const monthIdx = txDate.getMonth();
        if (tx.type === 'SALARY' || tx.type === 'BONUS') {
          monthlyEarnings[monthIdx] += tx.amount;
        }
        if (tx.type === 'BONUS') {
          monthlyBonuses[monthIdx] += tx.amount;
        }
      }
    });

    const formatCurrency = (val: number) => {
      return `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    res.status(200).json({
      bankInfo: {
        bankName: profile?.bankName || 'Faysal Bank',
        accountNumber: profile?.accountNumber || '1234567890',
        accountHolderName: profile?.accountHolderName || profile?.fullName || 'Test User'
      },
      summary: {
        netSalary: formatCurrency(netSalaryAmount),
        monthlySalary: formatCurrency(monthlySalaryAmount),
        bonus: formatCurrency(thisMonthBonus),
        deduction: formatCurrency(thisMonthDeduction),
        netSalaryRaw: netSalaryAmount,
        monthlySalaryRaw: monthlySalaryAmount,
        bonusRaw: thisMonthBonus,
        deductionRaw: thisMonthDeduction,
      },
      charts: {
        earnings: monthlyEarnings,
        bonuses: monthlyBonuses
      },
      transactions: transactions.map(tx => ({
        id: tx.id,
        title: tx.title,
        reference: tx.reference,
        amount: formatCurrency(tx.amount),
        amountRaw: tx.amount,
        type: tx.type,
        date: tx.date,
        status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1).toLowerCase()
      }))
    });
  } catch (error) {
    console.error('Get employee finance details error:', error);
    res.status(500).json({ error: 'Internal server error fetching finance data' });
  }
};

export const getEmployeeFinanceDataForAdmin = async (req: Request, res: Response): Promise<void> => {
  const adminId = (req as any).userId;
  const { userId } = req.params;
  
  if (!adminId) {
    res.status(401).json({ error: 'Unauthorized user context' });
    return;
  }

  try {
    const requester = await prisma.user.findUnique({ where: { id: adminId } });
    if (!requester || requester.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied: Admin only' });
      return;
    }

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthlySalaryAmount = 0;
    if (profile && profile.salary) {
      monthlySalaryAmount = parseFloat(profile.salary.replace(/[^0-9.]/g, '')) || 0;
    }

    let thisMonthBonus = 0;
    if (profile && profile.bonus && profile.bonus.trim().length > 0) {
      const parsedBonus = parseFloat(profile.bonus.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsedBonus)) {
        thisMonthBonus = parsedBonus;
      }
    }

    if (thisMonthBonus === 0) {
      transactions.forEach((tx) => {
        const txDate = new Date(tx.date);
        const isCurrentMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
        if (tx.status.toUpperCase() === 'SUCCESSFUL' && tx.type === 'BONUS' && isCurrentMonth) {
          thisMonthBonus += tx.amount;
        }
      });
    }

    let thisMonthDeduction = 0;
    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      const isCurrentMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      if (tx.status.toUpperCase() === 'SUCCESSFUL' && tx.type === 'DEDUCTION' && isCurrentMonth) {
        thisMonthDeduction += tx.amount;
      }
    });

    const netSalaryAmount = monthlySalaryAmount + thisMonthBonus - thisMonthDeduction;

    const monthlyEarnings = Array(12).fill(0);
    const monthlyBonuses = Array(12).fill(0);

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (txDate.getFullYear() === currentYear && tx.status.toUpperCase() === 'SUCCESSFUL') {
        const monthIdx = txDate.getMonth();
        if (tx.type === 'SALARY' || tx.type === 'BONUS') {
          monthlyEarnings[monthIdx] += tx.amount;
        }
        if (tx.type === 'BONUS') {
          monthlyBonuses[monthIdx] += tx.amount;
        }
      }
    });

    const formatCurrency = (val: number) => {
      return `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    res.status(200).json({
      bankInfo: {
        bankName: profile?.bankName || 'Faysal Bank',
        accountNumber: profile?.accountNumber || '1234567890',
        accountHolderName: profile?.accountHolderName || profile?.fullName || 'Test User'
      },
      summary: {
        netSalary: formatCurrency(netSalaryAmount),
        monthlySalary: formatCurrency(monthlySalaryAmount),
        bonus: formatCurrency(thisMonthBonus),
        deduction: formatCurrency(thisMonthDeduction),
        netSalaryRaw: netSalaryAmount,
        monthlySalaryRaw: monthlySalaryAmount,
        bonusRaw: thisMonthBonus,
        deductionRaw: thisMonthDeduction,
      },
      charts: {
        earnings: monthlyEarnings,
        bonuses: monthlyBonuses
      },
      transactions: transactions.map(tx => ({
        id: tx.id,
        title: tx.title,
        reference: tx.reference,
        amount: formatCurrency(tx.amount),
        amountRaw: tx.amount,
        type: tx.type,
        date: tx.date,
        status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1).toLowerCase()
      }))
    });
  } catch (error) {
    console.error('Get employee finance details for admin error:', error);
    res.status(500).json({ error: 'Internal server error fetching finance data' });
  }
};

export const addTransactionForAdmin = async (req: Request, res: Response): Promise<void> => {
  const adminId = (req as any).userId;
  if (!adminId) {
    res.status(401).json({ error: 'Unauthorized user context' });
    return;
  }

  try {
    const requester = await prisma.user.findUnique({ where: { id: adminId } });
    if (!requester || requester.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied: Admin only' });
      return;
    }

    const { userId, title, amount, type, reference, status } = req.body;
    if (!userId || !title || amount === undefined || !type || !status) {
      res.status(400).json({ error: 'Missing required transaction fields' });
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        title,
        amount: parseFloat(amount),
        type,
        reference: reference || `#${Math.floor(10000 + Math.random() * 90000)}`,
        status
      }
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction for admin error:', error);
    res.status(500).json({ error: 'Internal server error creating transaction' });
  }
};

export const deleteTransactionForAdmin = async (req: Request, res: Response): Promise<void> => {
  const adminId = (req as any).userId;
  if (!adminId) {
    res.status(401).json({ error: 'Unauthorized user context' });
    return;
  }

  try {
    const requester = await prisma.user.findUnique({ where: { id: adminId } });
    if (!requester || requester.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied: Admin only' });
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Transaction ID is required' });
      return;
    }

    await prisma.transaction.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction for admin error:', error);
    res.status(500).json({ error: 'Internal server error deleting transaction' });
  }
};

export const getAdminFinanceOverview = async (req: Request, res: Response): Promise<void> => {
  const adminId = (req as any).userId;
  if (!adminId) {
    res.status(401).json({ error: 'Unauthorized user context' });
    return;
  }

  try {
    const requester = await prisma.user.findUnique({ where: { id: adminId } });
    if (!requester || requester.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied: Admin only' });
      return;
    }

    const employees = await prisma.user.findMany({
      where: { role: 'Employee', status: 'APPROVED' },
      include: {
        profile: true,
        transactions: true
      }
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalPayrollBudget = 0;
    let totalBonusesThisMonth = 0;
    let totalDeductionsThisMonth = 0;

    const employeeList = employees.map((emp) => {
      let salaryVal = 0;
      if (emp.profile && emp.profile.salary) {
        salaryVal = parseFloat(emp.profile.salary.replace(/[^0-9.]/g, '')) || 0;
      }
      totalPayrollBudget += salaryVal;

      let empBonusThisMonth = 0;
      let empDeductionThisMonth = 0;

      emp.transactions.forEach((tx) => {
        const txDate = new Date(tx.date);
        const isCurrentMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;

        if (tx.status.toUpperCase() === 'SUCCESSFUL') {
          if (tx.type === 'BONUS') {
            if (isCurrentMonth) {
              empBonusThisMonth += tx.amount;
              totalBonusesThisMonth += tx.amount;
            }
          } else if (tx.type === 'DEDUCTION') {
            if (isCurrentMonth) {
              empDeductionThisMonth += tx.amount;
              totalDeductionsThisMonth += tx.amount;
            }
          }
        }
      });

      return {
        id: emp.id,
        email: emp.email,
        fullName: emp.profile?.fullName || '—',
        department: emp.profile?.department || '—',
        jobTitle: emp.profile?.jobTitle || '—',
        bankName: emp.profile?.bankName || '—',
        accountNumber: emp.profile?.accountNumber || '—',
        salary: emp.profile?.salary || '$0',
        salaryRaw: salaryVal,
        bonus: emp.profile?.bonus || '$0',
        bonusThisMonth: empBonusThisMonth,
        deductionThisMonth: empDeductionThisMonth,
        transactionsCount: emp.transactions.length
      };
    });

    res.status(200).json({
      stats: {
        totalPayrollBudget: `$${totalPayrollBudget.toLocaleString()}`,
        totalBonusesThisMonth: `$${totalBonusesThisMonth.toLocaleString()}`,
        totalDeductionsThisMonth: `$${totalDeductionsThisMonth.toLocaleString()}`,
        totalEmployeesCount: employeeList.length
      },
      employees: employeeList
    });
  } catch (error) {
    console.error('Get admin finance overview error:', error);
    res.status(500).json({ error: 'Internal server error fetching admin finance details' });
  }
};
