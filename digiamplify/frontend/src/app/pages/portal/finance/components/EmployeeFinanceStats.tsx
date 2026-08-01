'use client';

import React from 'react';
import { Database, CalendarClock, Trophy, MinusCircle } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 select-none animate-fadeIn">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl py-4 px-5 sm:py-4.5 sm:px-6 flex items-center gap-4">
        <div className="p-3 bg-red-500/10 rounded-lg text-[#be0919] shrink-0">
          <Database className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-xs sm:text-sm text-neutral-400 font-light block whitespace-nowrap">Net Salary</span>
          <span className="text-xl sm:text-2xl font-medium mt-1 block text-white">{summary.netSalary}</span>
          <span className="text-[10px] sm:text-xs text-neutral-500 mt-1 block font-light whitespace-nowrap">
            {latestSalaryDateString ? `Paid on ${latestSalaryDateString}` : 'No payment history'}
          </span>
        </div>
      </div>

      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl py-4 px-5 sm:py-4.5 sm:px-6 flex items-center gap-4">
        <div className="p-3 bg-red-500/10 rounded-lg text-[#be0919] shrink-0">
          <CalendarClock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-xs sm:text-sm text-neutral-400 font-light block whitespace-nowrap">Monthly Salary</span>
          <span className="text-xl sm:text-2xl font-medium mt-1 block text-white">{summary.monthlySalary}</span>
          <span className="text-[10px] sm:text-xs text-neutral-500 mt-1 block font-light whitespace-nowrap">
            {latestSalaryDateString ? `Paid on ${latestSalaryDateString}` : 'No payment history'}
          </span>
        </div>
      </div>

      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl py-4 px-5 sm:py-4.5 sm:px-6 flex items-center gap-4">
        <div className="p-3 bg-red-500/10 rounded-lg text-[#be0919] shrink-0">
          <Trophy className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-xs sm:text-sm text-neutral-400 font-light block whitespace-nowrap">Bonus</span>
          <span className="text-xl sm:text-2xl font-medium mt-1 block text-white">{summary.bonus}</span>
          <span className="text-[10px] sm:text-xs text-neutral-500 mt-1 block font-light whitespace-nowrap">For {currentMonthName} {currentYear}</span>
        </div>
      </div>

      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl py-4 px-5 sm:py-4.5 sm:px-6 flex items-center gap-4">
        <div className="p-3 bg-red-500/10 rounded-lg text-[#be0919] shrink-0">
          <MinusCircle className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-xs sm:text-sm text-neutral-400 font-light block whitespace-nowrap">Deduction</span>
          <span className="text-xl sm:text-2xl font-medium mt-1 block text-white">{summary.deduction}</span>
          <span className="text-[10px] sm:text-xs text-neutral-500 mt-1 block font-light whitespace-nowrap">For {currentMonthName} {currentYear}</span>
        </div>
      </div>
    </div>
  );
}
