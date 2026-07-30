'use client';

import React from 'react';
import { Coins, CreditCard, TrendingUp, ArrowDownRight } from 'lucide-react';

interface Summary {
  netSalary: string;
  monthlySalary: string;
  bonus: string;
  deduction: string;
}

interface EmployeeFinanceStatsProps {
  summary: Summary;
  latestSalaryDateString: string | null;
  currentMonthName: string;
  currentYear: number;
}

export default function EmployeeFinanceStats({
  summary,
  latestSalaryDateString,
  currentMonthName,
  currentYear
}: EmployeeFinanceStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 select-none animate-fadeIn">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 sm:p-7 flex items-start gap-4">
        <div className="p-3 bg-red-500/10 rounded-lg text-[#be0919]">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs sm:text-sm text-neutral-400 font-semibold block">Net Salary</span>
          <span className="text-xl sm:text-2xl font-bold mt-1.5 block">{summary.netSalary}</span>
          <span className="text-xs text-neutral-500 mt-2 block font-light">
            {latestSalaryDateString ? `Paid on ${latestSalaryDateString}` : 'No payment history'}
          </span>
        </div>
      </div>

      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 sm:p-7 flex items-start gap-4">
        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs sm:text-sm text-neutral-400 font-semibold block">Monthly Salary</span>
          <span className="text-xl sm:text-2xl font-bold mt-1.5 block">{summary.monthlySalary}</span>
          <span className="text-xs text-neutral-500 mt-2 block font-light">
            {latestSalaryDateString ? `Paid on ${latestSalaryDateString}` : 'No payment history'}
          </span>
        </div>
      </div>

      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 sm:p-7 flex items-start gap-4">
        <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs sm:text-sm text-neutral-400 font-semibold block">Bonus</span>
          <span className="text-xl sm:text-2xl font-bold mt-1.5 block text-emerald-400">{summary.bonus}</span>
          <span className="text-xs text-neutral-500 mt-2 block font-light">For {currentMonthName} {currentYear}</span>
        </div>
      </div>

      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 sm:p-7 flex items-start gap-4">
        <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
          <ArrowDownRight className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs sm:text-sm text-neutral-400 font-semibold block">Deduction</span>
          <span className="text-xl sm:text-2xl font-bold mt-1.5 block text-red-500">{summary.deduction}</span>
          <span className="text-xs text-neutral-500 mt-2 block font-light">For {currentMonthName} {currentYear}</span>
        </div>
      </div>
    </div>
  );
}
