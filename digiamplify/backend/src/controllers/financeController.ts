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
    const requester = await prisma.user.findUnique({
      where: { id: adminId },
      include: { profile: true }
    });
    if (!requester || requester.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied: Admin only' });
      return;
    }

    const employees = await prisma.user.findMany({
      where: { role: 'Employee', status: 'APPROVED' },
      include: {
        profile: true,
        transactions: { orderBy: { date: 'desc' } }
      }
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalPayrollBudget = 0;
    let totalPaidAmount = 0;
    let totalPendingAmount = 0;
    let totalBonusesThisMonth = 0;
    let totalDeductionsThisMonth = 0;
    let overdueEmployeesCount = 0;

    const monthlyAnalytics = Array(12).fill(0);

    const employeeList = employees.map((emp) => {
      let salaryVal = 0;
      if (emp.profile && emp.profile.salary) {
        salaryVal = parseFloat(emp.profile.salary.replace(/[^0-9.]/g, '')) || 0;
      }
      totalPayrollBudget += salaryVal;

      let empBonusThisMonth = 0;
      let empDeductionThisMonth = 0;
      let hasPending = false;
      let hasSuccessfulSalary = false;

      emp.transactions.forEach((tx) => {
        const txDate = new Date(tx.date);
        const isCurrentMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;

        if (txDate.getFullYear() === currentYear && tx.status.toUpperCase() === 'SUCCESSFUL') {
          monthlyAnalytics[txDate.getMonth()] += tx.amount;
        }

        if (isCurrentMonth) {
          if (tx.status.toUpperCase() === 'SUCCESSFUL') {
            if (tx.type === 'SALARY') {
              hasSuccessfulSalary = true;
              totalPaidAmount += tx.amount;
            } else if (tx.type === 'BONUS') {
              empBonusThisMonth += tx.amount;
              totalBonusesThisMonth += tx.amount;
              totalPaidAmount += tx.amount;
            } else if (tx.type === 'DEDUCTION') {
              empDeductionThisMonth += tx.amount;
              totalDeductionsThisMonth += tx.amount;
            }
          } else if (tx.status.toUpperCase() === 'PENDING') {
            hasPending = true;
            totalPendingAmount += tx.amount;
          }
        }
      });

      if (!hasSuccessfulSalary && salaryVal > 0) {
        overdueEmployeesCount++;
      }

      const latestTx = emp.transactions.length > 0 ? emp.transactions[0] : null;
      const formattedDate = latestTx
        ? new Date(latestTx.date).toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' }) +
          ', ' +
          new Date(latestTx.date).toLocaleTimeString('default', { hour: 'numeric', minute: '2-digit', hour12: true })
        : 'No recent transaction';

      const overallStatus = hasPending ? 'Pending' : 'Completed';

      return {
        id: emp.id,
        email: emp.email,
        fullName: emp.profile?.fullName || emp.email.split('@')[0],
        department: emp.profile?.department || '—',
        jobTitle: emp.profile?.jobTitle || '—',
        bankName: emp.profile?.bankName || 'Main Bank',
        accountNumber: emp.profile?.accountNumber ? `#${emp.profile.accountNumber.slice(-5)}` : '—',
        salary: `$${salaryVal.toLocaleString()}`,
        salaryRaw: salaryVal,
        bonus: empBonusThisMonth > 0 ? `$${empBonusThisMonth.toLocaleString()}` : '—',
        deduction: empDeductionThisMonth > 0 ? `$${empDeductionThisMonth.toLocaleString()}` : '—',
        bonusThisMonth: empBonusThisMonth,
        deductionThisMonth: empDeductionThisMonth,
        dateFormatted: formattedDate,
        status: overallStatus,
        transactionsCount: emp.transactions.length
      };
    });

    const paidPercent = totalPayrollBudget > 0 ? Math.round((totalPaidAmount / totalPayrollBudget) * 100) : 0;
    const pendingPercent = totalPayrollBudget > 0 ? Math.round((totalPendingAmount / totalPayrollBudget) * 100) : 0;
    const overdueAmount = totalPayrollBudget > totalPaidAmount ? totalPayrollBudget - totalPaidAmount : 0;

    // Query real recent transactions across company for performance alerts
    const recentTransactions = await prisma.transaction.findMany({
      take: 6,
      orderBy: { date: 'desc' },
      include: {
        user: {
          include: { profile: true }
        }
      }
    });

    const performanceAlerts = recentTransactions.map((tx) => {
      const empName = tx.user.profile?.fullName || tx.user.email.split('@')[0];
      const timeStr = new Date(tx.date).toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' }) +
        ', ' +
        new Date(tx.date).toLocaleTimeString('default', { hour: 'numeric', minute: '2-digit', hour12: true });

      let title = `${tx.type === 'SALARY' ? 'Payroll processed' : tx.type === 'BONUS' ? 'Bonus added' : 'Deduction updated'} for ${empName}`;
      if (tx.title && tx.title.length > 0) {
        title = `${tx.title} for ${empName}`;
      }

      return {
        id: tx.id,
        title,
        timestamp: timeStr
      };
    });

    res.status(200).json({
      adminName: requester.profile?.fullName || requester.email.split('@')[0],
      stats: {
        totalPayroll: `PKR ${totalPayrollBudget.toLocaleString()}`,
        totalPayrollRaw: totalPayrollBudget,
        employeesCount: employeeList.length,
        paidAmount: `PKR ${totalPaidAmount.toLocaleString()}`,
        paidPercent: `${paidPercent}% of total payroll`,
        pendingAmount: `PKR ${totalPendingAmount.toLocaleString()}`,
        pendingPercent: `${pendingPercent}% of total payroll`,
        overdueAmount: `PKR ${overdueAmount.toLocaleString()}`,
        overdueEmployees: `${overdueEmployeesCount} Employees`
      },
      monthlyAnalytics,
      performanceAlerts,
      employees: employeeList
    });
  } catch (error) {
    console.error('Get admin finance overview error:', error);
    res.status(500).json({ error: 'Internal server error fetching admin finance details' });
  }
};



export const updateEmployeeCardInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized user context' });
      return;
    }
    const { bankName, accountHolderName, accountNumber } = req.body;
    if (!bankName || !accountHolderName || !accountNumber) {
      res.status(400).json({ error: 'Bank Name, Account Holder Name, and Account Number are required.' });
      return;
    }

    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: { bankName, accountHolderName, accountNumber },
      create: { userId, bankName, accountHolderName, accountNumber }
    });

    res.status(200).json({ message: 'Card and bank information updated successfully', profile: updatedProfile });
  } catch (error) {
    console.error('Update employee card error:', error);
    res.status(500).json({ error: 'Internal server error updating card info' });
  }
};

export const employeeWithdraw = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized user context' });
      return;
    }
    const { amount, description } = req.body;
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      res.status(400).json({ error: 'Invalid withdrawal amount' });
      return;
    }

    const profile = await prisma.profile.findUnique({ where: { userId } });
    const transactions = await prisma.transaction.findMany({ where: { userId } });
    
    let monthlySalaryAmount = 0;
    if (profile && profile.salary) {
      monthlySalaryAmount = parseFloat(profile.salary.replace(/[^0-9.]/g, '')) || 0;
    }
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let thisMonthBonus = 0;
    let thisMonthDeduction = 0;

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      const isCurrentMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      if (tx.status.toUpperCase() === 'SUCCESSFUL') {
        if (tx.type === 'BONUS' && isCurrentMonth) thisMonthBonus += tx.amount;
        if (tx.type === 'DEDUCTION' && isCurrentMonth) thisMonthDeduction += tx.amount;
      }
    });

    const currentNet = monthlySalaryAmount + thisMonthBonus - thisMonthDeduction;
    if (withdrawAmount > currentNet) {
      res.status(400).json({ error: `Withdrawal amount ($${withdrawAmount}) exceeds your available net salary balance ($${currentNet}).` });
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        title: description ? `Withdrawal: ${description}` : 'Account Withdrawal',
        amount: withdrawAmount,
        type: 'DEDUCTION',
        reference: `#WD-${Math.floor(10000 + Math.random() * 90000)}`,
        status: 'SUCCESSFUL'
      }
    });

    res.status(201).json({ message: 'Withdrawal processed successfully', transaction });
  } catch (error) {
    console.error('Employee withdraw error:', error);
    res.status(500).json({ error: 'Internal server error processing withdrawal' });
  }
};

export const employeeRequestTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized user context' });
      return;
    }
    const { title, amount, type } = req.body;
    if (!title || !amount || !type) {
      res.status(400).json({ error: 'Title, amount, and type are required for requests.' });
      return;
    }

    const requestAmount = parseFloat(amount);
    if (isNaN(requestAmount) || requestAmount <= 0) {
      res.status(400).json({ error: 'Invalid request amount' });
      return;
    }

    const refPrefix = type.toUpperCase() === 'BONUS' ? 'REQ-B' : 'REQ-A';
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        title: `${type.toUpperCase() === 'BONUS' ? 'Reimbursement' : 'Salary Advance'}: ${title}`,
        amount: requestAmount,
        type: type.toUpperCase(),
        reference: `#${refPrefix}-${Math.floor(10000 + Math.random() * 90000)}`,
        status: 'PENDING'
      }
    });

    res.status(201).json({ message: 'Financial request submitted for approval', transaction });
  } catch (error) {
    console.error('Employee request transaction error:', error);
    res.status(500).json({ error: 'Internal server error submitting request' });
  }
};

export const adminUpdateTransactionStatus = async (req: Request, res: Response): Promise<void> => {
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
    const { status } = req.body;

    if (!id || !status) {
      res.status(400).json({ error: 'Transaction ID and new status are required' });
      return;
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ message: `Transaction status updated to ${status}`, transaction });
  } catch (error) {
    console.error('Admin update transaction status error:', error);
    res.status(500).json({ error: 'Internal server error updating status' });
  }
};

