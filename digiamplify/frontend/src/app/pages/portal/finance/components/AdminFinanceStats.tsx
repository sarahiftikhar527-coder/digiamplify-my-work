'use client';

import React from 'react';
import { Coins, TrendingUp, ArrowDownRight, User } from 'lucide-react';

interface AdminFinanceStatsProps {
  stats: {
    totalPayrollBudget: string;
    totalBonusesThisMonth: string;
    totalDeductionsThisMonth: string;
    totalEmployeesCount: number;
  };
}

export default function AdminFinanceStats({ stats }: AdminFinanceStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 select-none animate-fadeIn">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 sm:p-7 flex items-start gap-4 shadow-sm">
        <div className="p-3 bg-red-500/10 rounded-lg text-[#be0919]">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs sm:text-sm text-neutral-400 font-semibold block">Total Monthly Payroll</span>
          <span className="text-xl sm:text-2xl font-bold mt-1.5 block">{stats.totalPayrollBudget}</span>
        </div>
      </div>

      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 sm:p-7 flex items-start gap-4 shadow-sm">
        <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs sm:text-sm text-neutral-400 font-semibold block">Total Bonuses (Month)</span>
          <span className="text-xl sm:text-2xl font-bold mt-1.5 block text-emerald-400">{stats.totalBonusesThisMonth}</span>
        </div>
      </div>

      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 sm:p-7 flex items-start gap-4 shadow-sm">
        <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
          <ArrowDownRight className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs sm:text-sm text-neutral-400 font-semibold block">Total Deductions (Month)</span>
          <span className="text-xl sm:text-2xl font-bold mt-1.5 block text-red-500">{stats.totalDeductionsThisMonth}</span>
        </div>
      </div>

      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 sm:p-7 flex items-start gap-4 shadow-sm">
        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
          <User className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs sm:text-sm text-neutral-400 font-semibold block">Active Employees</span>
          <span className="text-xl sm:text-2xl font-bold mt-1.5 block text-blue-400">{stats.totalEmployeesCount}</span>
        </div>
      </div>
    </div>
  );
}
