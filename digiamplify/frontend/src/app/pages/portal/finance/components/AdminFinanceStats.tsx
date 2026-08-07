'use client';

import React from 'react';
import { Wallet, CreditCard, Clock, AlertCircle } from 'lucide-react';

interface AdminFinanceStatsProps {
  stats: {
    totalPayroll?: string;
    employeesCount?: number;
    paidAmount?: string;
    paidPercent?: string;
    pendingAmount?: string;
    pendingPercent?: string;
    overdueAmount?: string;
    overdueEmployees?: string;
    // Fallbacks
    totalPayrollBudget?: string;
    totalBonusesThisMonth?: string;
    totalDeductionsThisMonth?: string;
    totalEmployeesCount?: number;
  };
}

export default function AdminFinanceStats({ stats }: AdminFinanceStatsProps) {
  const totalPayroll = stats.totalPayroll || stats.totalPayrollBudget || 'PKR 1,23456';
  const employeesCount = stats.employeesCount !== undefined ? stats.employeesCount : (stats.totalEmployeesCount || 32);
  const paidAmount = stats.paidAmount || 'PKR 1,23456';
  const paidPercent = stats.paidPercent || '17% of total payroll';
  const pendingAmount = stats.pendingAmount || 'PKR 1,23456';
  const pendingPercent = stats.pendingPercent || '27% of total payroll';
  const overdueAmount = stats.overdueAmount || 'PKR 1,23456';
  const overdueEmployees = stats.overdueEmployees || '5 Employees';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 select-none animate-fadeIn">
      {/* 1. Total Payroll */}
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
        <div className="p-3.5 bg-[#20080a] border border-[#3d0d12] rounded-xl text-[#be0919] shrink-0">
          <Wallet className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-xs sm:text-sm text-neutral-400 font-normal block whitespace-nowrap">Total Payroll</span>
          <span className="text-xl sm:text-2xl font-bold mt-1 block text-white tracking-wide">{totalPayroll}</span>
          <span className="text-xs text-neutral-500 mt-1 block font-light">For {employeesCount} Employees</span>
        </div>
      </div>

      {/* 2. Paid Amount */}
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
        <div className="p-3.5 bg-[#082012] border border-[#0d3d1e] rounded-xl text-emerald-400 shrink-0">
          <CreditCard className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-xs sm:text-sm text-neutral-400 font-normal block whitespace-nowrap">Paid Amount</span>
          <span className="text-xl sm:text-2xl font-bold mt-1 block text-white tracking-wide">{paidAmount}</span>
          <span className="text-xs text-emerald-400 mt-1 block font-normal">{paidPercent}</span>
        </div>
      </div>

      {/* 3. Pending Amount */}
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
        <div className="p-3.5 bg-[#241a06] border border-[#4d380e] rounded-xl text-[#ffd54f] shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-xs sm:text-sm text-neutral-400 font-normal block whitespace-nowrap">Pending Amount</span>
          <span className="text-xl sm:text-2xl font-bold mt-1 block text-white tracking-wide">{pendingAmount}</span>
          <span className="text-xs text-[#ffd54f] mt-1 block font-normal">{pendingPercent}</span>
        </div>
      </div>

      {/* 4. Overdue Payments */}
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
        <div className="p-3.5 bg-[#20080a] border border-[#3d0d12] rounded-xl text-[#ff5252] shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-xs sm:text-sm text-neutral-400 font-normal block whitespace-nowrap">Overdue Payments</span>
          <span className="text-xl sm:text-2xl font-bold mt-1 block text-white tracking-wide">{overdueAmount}</span>
          <span className="text-xs text-[#ff5252] mt-1 block font-normal">{overdueEmployees}</span>
        </div>
      </div>
    </div>
  );
}

