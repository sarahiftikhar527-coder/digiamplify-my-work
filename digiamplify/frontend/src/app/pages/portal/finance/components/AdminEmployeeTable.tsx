'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface Employee {
  id: string;
  fullName: string;
  email: string;
  department: string;
  jobTitle: string;
  bankName: string;
  accountNumber: string;
  salary: string;
  bonusThisMonth: number;
  deductionThisMonth: number;
}

interface AdminEmployeeTableProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filteredEmployees: Employee[];
  handleManageEmployee: (emp: Employee) => void;
}

export default function AdminEmployeeTable({
  searchQuery,
  setSearchQuery,
  filteredEmployees,
  handleManageEmployee
}: AdminEmployeeTableProps) {
  return (
    <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 sm:p-8 lg:p-10 shadow-md animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-5 border-b border-neutral-900">
        <div>
          <h3 className="text-base sm:text-lg font-bold tracking-wide select-none">Employee Payroll Directory</h3>
          <p className="text-xs sm:text-sm text-neutral-500 font-light mt-1.5">Select an employee to manage their salary, bonuses, and deductions history.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-[#050505] border border-neutral-800 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-red-500/50 font-light"
          />
        </div>
      </div>

      <div className="overflow-x-auto w-full custom-scrollbar pb-3">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-neutral-800 text-xs font-bold text-neutral-400 uppercase tracking-wider select-none">
              <th className="pb-4 px-4">Employee</th>
              <th className="pb-4 px-4">Department & Role</th>
              <th className="pb-4 px-4">Bank Details</th>
              <th className="pb-4 px-4">Monthly Salary</th>
              <th className="pb-4 px-4">Bonus This Month</th>
              <th className="pb-4 px-4">Deduction This Month</th>
              <th className="pb-4 px-4 text-right pr-6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900 text-sm">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-white/2 transition-colors">
                  <td className="py-4.5 px-4">
                    <span className="font-semibold text-white block text-sm sm:text-[15px]">{emp.fullName}</span>
                    <span className="text-xs text-neutral-400 block mt-1">{emp.email}</span>
                  </td>
                  <td className="py-4.5 px-4 text-neutral-300 font-light">
                    <span className="block font-medium text-white">{emp.department}</span>
                    <span className="text-xs text-neutral-400 block mt-1">{emp.jobTitle}</span>
                  </td>
                  <td className="py-4.5 px-4 text-neutral-300 font-light">
                    <span className="block font-medium text-white">{emp.bankName}</span>
                    <span className="text-xs text-neutral-400 block mt-1">{emp.accountNumber}</span>
                  </td>
                  <td className="py-4.5 px-4 font-semibold text-white text-sm sm:text-[15px]">
                    {emp.salary || '$0'}
                  </td>
                  <td className="py-4.5 px-4 font-bold text-emerald-400 text-sm sm:text-[15px] whitespace-nowrap">
                    +${emp.bonusThisMonth.toLocaleString()}
                  </td>
                  <td className="py-4.5 px-4 font-bold text-red-400 text-sm sm:text-[15px] whitespace-nowrap">
                    -${emp.deductionThisMonth.toLocaleString()}
                  </td>
                  <td className="py-4.5 px-4 text-right pr-6">
                    <button
                      onClick={() => handleManageEmployee(emp)}
                      className="bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold py-2.5 px-5 rounded-lg transition-all shadow-[0_2px_8px_rgba(190,9,25,0.2)] cursor-pointer whitespace-nowrap"
                    >
                      Manage Finances
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm sm:text-base text-neutral-500 font-light select-none">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
