'use client';

import React, { useState } from 'react';
import { X, Search, UserX, Calendar, AlertCircle } from 'lucide-react';

interface AbsenteeismDetailModalProps {
  onClose: () => void;
  absentCount: number;
  currentMonthYearStr: string;
}

export default function AbsenteeismDetailModal({
  onClose,
  absentCount,
  currentMonthYearStr
}: AbsenteeismDetailModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample employee absenteeism records
  const absentRecords = [
    {
      id: '1',
      name: 'Fahad',
      role: 'Web Developer',
      avatar: 'F',
      date: '06 Aug 2026',
      reason: 'Employee absent',
      status: 'UNEXCUSED',
      department: 'Engineering'
    },
    {
      id: '2',
      name: 'Sarah Connor',
      role: 'UI/UX Designer',
      avatar: 'S',
      date: '20 Aug 2026',
      reason: 'Medical Emergency',
      status: 'EXCUSED',
      department: 'Design'
    },
    {
      id: '3',
      name: 'Ali Ahmed',
      role: 'Frontend Engineer',
      avatar: 'A',
      date: '03 Jul 2026',
      reason: 'Casual Leave',
      status: 'APPROVED_LEAVE',
      department: 'Engineering'
    },
    {
      id: '4',
      name: 'Hamza Malik',
      role: 'Product Manager',
      avatar: 'H',
      date: '23 Jul 2026',
      reason: 'Unannounced absence',
      status: 'UNEXCUSED',
      department: 'Product'
    }
  ];

  const filteredRecords = absentRecords.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-[#0d0d0d] border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-[#050505]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/70 border border-amber-800/40 flex items-center justify-center text-amber-500">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Employee Absenteeism Details
              </h2>
              <p className="text-xs text-neutral-400 font-light mt-0.5">
                Overview for {currentMonthYearStr}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats Bar */}
        <div className="p-6 border-b border-neutral-800/60 grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#0a0a0a]">
          <div className="bg-[#050505] border border-neutral-900 p-4 rounded-2xl">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Total Absences</span>
            <span className="text-xl font-extrabold text-amber-500 block mt-1">{absentCount} Days</span>
          </div>

          <div className="bg-[#050505] border border-neutral-900 p-4 rounded-2xl">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Attendance Rate</span>
            <span className="text-xl font-extrabold text-emerald-400 block mt-1">94.2%</span>
          </div>

          <div className="bg-[#050505] border border-neutral-900 p-4 rounded-2xl col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Unexcused</span>
            <span className="text-xl font-extrabold text-red-500 block mt-1">2 Records</span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="p-6 border-b border-neutral-800/60 bg-[#0d0d0d]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by employee name, role, or department..."
              className="w-full bg-[#141414] border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Absence Records List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((r) => {
              const isUnexcused = r.status === 'UNEXCUSED';
              const isApproved = r.status === 'APPROVED_LEAVE';

              let badgeStyle = 'bg-amber-950/60 text-amber-400 border-amber-800/40';
              if (isUnexcused) badgeStyle = 'bg-red-950/60 text-red-400 border-red-800/40';
              if (isApproved) badgeStyle = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40';

              return (
                <div
                  key={r.id}
                  className="bg-[#050505] border border-neutral-900 hover:border-neutral-800 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#be0919] text-white font-extrabold flex items-center justify-center text-sm shrink-0 shadow-md">
                      {r.avatar}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">{r.name}</h4>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">{r.role} • {r.department}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div>
                      <span className="text-xs font-bold text-white block">{r.date}</span>
                      <span className="text-[10px] text-neutral-500 block mt-0.5">{r.reason}</span>
                    </div>

                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${badgeStyle}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-neutral-500 text-xs">
              No absenteeism records found
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-800/80 bg-[#050505] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
