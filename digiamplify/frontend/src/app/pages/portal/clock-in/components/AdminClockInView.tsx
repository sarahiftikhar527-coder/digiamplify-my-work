import React from 'react';
import { Users, CheckCircle, Clock, Coffee, AlertCircle, Search, Eye, Download } from 'lucide-react';
import { downloadCSV } from '@/utils/csvHelper';

interface AdminClockInViewProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  totalEmployeesCount: number;
  presentEmployeesCount: number;
  absentEmployeesCount: number;
  lateEmployeesCount: number;
  onBreakEmployeesCount: number;
  filteredRecords: any[];
  onViewNoteClick: (rec: any) => void;
}

export default function AdminClockInView({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  totalEmployeesCount,
  presentEmployeesCount,
  absentEmployeesCount,
  lateEmployeesCount,
  onBreakEmployeesCount,
  filteredRecords,
  onViewNoteClick
}: AdminClockInViewProps) {
  const hasActiveRecords = filteredRecords.some(rec => rec.status.toUpperCase() !== 'ABSENT');

  const handleDownloadCSV = () => {
    const headers = [
      'Employee ID',
      'Full Name',
      'Email',
      'Shift',
      'Clock In',
      'Clock Out',
      'Status',
      'Task Summary (Description)'
    ];

    downloadCSV(headers, filteredRecords, 'attendance_records.csv', (rec: any) => [
      rec.id,
      rec.fullName,
      rec.email,
      rec.shift,
      rec.clockIn,
      rec.clockOut,
      rec.status,
      rec.description || ''
    ]);
  };

  return (
    <div className="w-full flex flex-col justify-start">

      <div className="mb-12 select-none">
        <h1 className="text-3xl font-medium tracking-wide text-white">Clock In</h1>
        <p className="text-sm text-neutral-400 font-medium mt-3 leading-relaxed">
          Monitor your employees clock in/out statuses, shift logs, breaks, and daily task summaries.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-10 select-none animate-fadeIn">

        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-bold text-neutral-400 uppercase tracking-wide">Total Staff</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-white">{totalEmployeesCount}</span>
        </div>

        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-bold text-neutral-400 uppercase tracking-wide">Clocked In</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-white">{presentEmployeesCount}</span>
        </div>

        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-bold text-neutral-400 uppercase tracking-wide">Late</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-white">{lateEmployeesCount}</span>
        </div>

        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-bold text-neutral-400 uppercase tracking-wide">On Break</span>
            <Coffee className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-2xl font-bold text-white">{onBreakEmployeesCount}</span>
        </div>

        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-bold text-neutral-400 uppercase tracking-wide">Absent</span>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-2xl font-bold text-white">{absentEmployeesCount}</span>
        </div>

      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 animate-fadeIn">

        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none select-none">
            <Search className="w-4 h-4 text-neutral-500" />
          </span>
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0c0c0c] border border-neutral-800 text-xs text-white rounded-xl py-3 pl-10 pr-4 placeholder-neutral-500 focus:outline-none focus:border-[#be0919]/50 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider select-none shrink-0">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0c0c0c] border border-neutral-800 text-xs text-white rounded-xl py-2.5 pl-4 pr-10 font-semibold hover:border-neutral-750 focus:outline-none cursor-pointer"
          >
            <option value="all">All</option>
            <option value="clocked in">Clocked In</option>
            <option value="clocked out">Clocked Out</option>
            <option value="late">Late</option>
            <option value="on break">On Break</option>
            <option value="absent">Absent</option>
          </select>
        </div>

      </div>

      <div className="bg-black border border-neutral-900 rounded-xl overflow-hidden shadow-lg animate-fadeIn">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[850px] table-fixed">
            <thead>
              <tr className="border-b border-neutral-900 text-neutral-500 select-none text-[11px] font-bold uppercase tracking-widest bg-[#050505]">
                <th className="py-4.5 px-6 font-semibold w-[25%]">Employee</th>
                <th className="py-4.5 px-6 font-semibold w-[15%]">Shift</th>
                <th className="py-4.5 px-6 font-semibold w-[15%]">Clock In</th>
                <th className="py-4.5 px-6 font-semibold w-[15%]">Clock Out</th>
                <th className="py-4.5 px-6 font-semibold w-[15%] text-center">Status</th>
                <th className="py-4.5 px-6 font-semibold w-[15%] text-right pr-6">Task Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 font-light text-neutral-300">
              {hasActiveRecords ? (
                filteredRecords
                  .filter((rec) => rec.status.toUpperCase() !== 'ABSENT')
                  .map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#050505]/45 transition-colors">
                      <td className="py-4.5 px-6">
                        <div className="flex flex-col">
                          <span className="text-base font-semibold text-white leading-tight">{rec.fullName}</span>
                          <span className="text-xs text-neutral-500 font-light mt-1 leading-none">{rec.email}</span>
                        </div>
                      </td>
                      <td className="py-4.5 px-6">
                        <span className="text-sm px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded font-semibold text-neutral-300 select-none">
                          {rec.shift.toLowerCase() === 'night' ? 'Night' : 'Day'}
                        </span>
                      </td>
                      <td className="py-4.5 px-6">
                        <span className={rec.clockIn !== '--:--' ? 'text-emerald-400 font-semibold text-sm whitespace-nowrap' : 'text-neutral-500 font-light text-sm whitespace-nowrap'}>
                          {rec.clockIn}
                        </span>
                      </td>
                      <td className="py-4.5 px-6">
                        <span className={rec.clockOut !== '--:--' ? 'text-emerald-400 font-semibold text-sm whitespace-nowrap' : 'text-neutral-500 font-light text-sm whitespace-nowrap'}>
                          {rec.clockOut}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase border select-none whitespace-nowrap ${rec.status.toLowerCase() === 'on time' || rec.status.toLowerCase().includes('late')
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : rec.status.toLowerCase() === 'clocked out'
                            ? 'bg-red-500/10 text-[#ff4d5a] border-red-500/20'
                            : rec.status.toLowerCase() === 'on break'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                          }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right pr-6">
                        {rec.description ? (
                          <button
                            onClick={() => onViewNoteClick(rec)}
                            className="px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 text-xs font-bold text-white hover:bg-neutral-850 transition-colors rounded-lg flex items-center gap-1.5 ml-auto cursor-pointer whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Note</span>
                          </button>
                        ) : (
                          <span className="text-xs text-neutral-600 font-light select-none">—</span>
                        )}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-neutral-500 font-light select-none">
                    No employee attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {hasActiveRecords && (
          <div className="flex justify-end p-6 border-t border-neutral-900 bg-[#050505]/20">
            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-2 bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold py-2.5 px-6 rounded transition-all shadow-[0_2px_8px_rgba(190,9,25,0.2)] hover:shadow-[0_2px_12px_rgba(190,9,25,0.35)] cursor-pointer"
            >
              <Download className="w-4.5 h-4.5" />
              <span>Download Attendance CSV</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
