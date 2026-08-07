'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface EmployeeRecord {
  id: string;
  fullName: string;
  email: string;
  department: string;
  jobTitle: string;
  salary: string;
  bonus: string;
  deduction: string;
  bankName: string;
  accountNumber: string;
  dateFormatted?: string;
  status: 'Completed' | 'Pending';
}

interface AdminEmployeePerformanceTableProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filteredEmployees: EmployeeRecord[];
  handleManageEmployee: (emp: EmployeeRecord) => void;
}

export default function AdminEmployeePerformanceTable({
  searchQuery,
  setSearchQuery,
  filteredEmployees,
  handleManageEmployee
}: AdminEmployeePerformanceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Pending'>('All');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const itemsPerPage = 5;

  const activeEmployees = filteredEmployees.filter((emp) => {
    if (statusFilter === 'All') return true;
    return emp.status === statusFilter;
  });

  const totalPages = Math.ceil(activeEmployees.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = activeEmployees.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-6 sm:p-8 shadow-sm animate-fadeIn">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-900 select-none">
        <h3 className="text-base sm:text-lg font-bold tracking-wide text-white">Employee Performance Overview</h3>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-60 bg-[#050505] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-red-500/50 font-light"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilterModal(!showFilterModal)}
              className={`px-4 py-2.5 bg-[#050505] border text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                statusFilter !== 'All' ? 'border-[#be0919] text-[#be0919]' : 'border-white/10 hover:border-white/20 text-white'
              }`}
            >
              <span>Filter {statusFilter !== 'All' ? `(${statusFilter})` : ''}</span>
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {showFilterModal && (
              <div className="absolute right-0 mt-2 w-44 bg-[#0c0c0c] border border-neutral-800 rounded-xl shadow-xl py-2 z-30 select-none">
                <span className="px-3.5 py-1 text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Filter By Status
                </span>
                {(['All', 'Completed', 'Pending'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setCurrentPage(1);
                      setShowFilterModal(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${
                      statusFilter === st ? 'text-[#be0919] bg-white/5' : 'text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{st === 'All' ? 'All Statuses' : st}</span>
                    {statusFilter === st && <span className="w-1.5 h-1.5 rounded-full bg-[#be0919]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Table */}
      <div className="overflow-x-auto w-full custom-scrollbar pb-3">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-900 text-[11px] font-bold text-neutral-400 uppercase tracking-wider select-none">
              <th className="pb-4 px-3">Employee</th>
              <th className="pb-4 px-3">Department</th>
              <th className="pb-4 px-3">Salary</th>
              <th className="pb-4 px-3">Bonus</th>
              <th className="pb-4 px-3">Deduction</th>
              <th className="pb-4 px-3">Bank</th>
              <th className="pb-4 px-3">Date</th>
              <th className="pb-4 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-950 text-xs sm:text-sm">
            {paginatedEmployees.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-neutral-500 font-light select-none">
                  No employees found in payroll directory.
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => handleManageEmployee(emp)}
                  className="hover:bg-white/2 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-3 flex items-center gap-3">

                  <div className="w-9 h-9 rounded-full bg-neutral-700/60 border border-neutral-600/40 flex items-center justify-center text-white font-bold text-xs shrink-0 select-none">
                    {emp.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-white block group-hover:text-red-400 transition-colors">
                      {emp.fullName}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-light block mt-0.5">
                      {emp.jobTitle}
                    </span>
                  </div>
                </td>

                <td className="py-4 px-3 text-neutral-300 font-normal">{emp.department}</td>
                <td className="py-4 px-3 font-semibold text-white">{emp.salary}</td>
                <td className="py-4 px-3 font-medium text-neutral-300">{emp.bonus}</td>
                <td className="py-4 px-3 font-medium text-neutral-300">{emp.deduction}</td>

                {/* Bank Details */}
                <td className="py-4 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#091a24] border border-[#13374d] text-cyan-400 flex items-center justify-center font-bold text-[9px] shrink-0">
                      FS
                    </div>
                    <div>
                      <span className="font-semibold text-white block text-xs">{emp.bankName}</span>
                      <span className="text-[10px] text-neutral-500 block font-mono">{emp.accountNumber}</span>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-3 text-neutral-400 font-light text-xs whitespace-nowrap">
                  {emp.dateFormatted || '30 July 2026, 10:30 AM'}
                </td>

                {/* Status Badge */}
                <td className="py-4 px-3 text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap select-none bg-[#051c14] text-[#00e676] border-[#0d472b] cursor-pointer hover:bg-[#07291d]">
                    <span className={emp.status === 'Completed' ? 'text-[#00e676]' : 'text-[#ffd54f]'}>
                      {emp.status}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                </td>
              </tr>
            ))
          )}

          </tbody>

        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-neutral-900 select-none">
        <span className="text-xs text-neutral-400 font-normal">
          Showing {currentPage} of {totalPages}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentPage === pageNum
                  ? 'bg-[#be0919] text-white shadow-md'
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
