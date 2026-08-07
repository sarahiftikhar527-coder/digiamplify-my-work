'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarRightSidebarProps {
  currentMonthYearStr: string;
  selectedMonth: string; // YYYY-MM e.g. "2026-07"
  selectedDate: string;  // YYYY-MM-DD e.g. "2026-07-13"
  onDateSelect: (dayNum: number) => void;
  eventsMap: { [dateStr: string]: any[] };
  onPrevMonth: () => void;
  onNextMonth: () => void;
  upcomingTasks: any[];
  absenteeism: { absentCount: number; percentage: number };
  leaveRequests: any[];
  onRequestLeaveClick: () => void;
  onViewAbsenteeismClick?: () => void;
}

export default function CalendarRightSidebar({
  currentMonthYearStr,
  selectedMonth,
  selectedDate,
  onDateSelect,
  eventsMap,
  onPrevMonth,
  onNextMonth,
  upcomingTasks,
  absenteeism,
  leaveRequests,
  onRequestLeaveClick,
  onViewAbsenteeismClick
}: CalendarRightSidebarProps) {

  const miniDaysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Dynamically calculate mini grid for selectedMonth
  const [yearStr, monthStr] = (selectedMonth || '2026-07').split('-');
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;

  const firstDay = new Date(year, monthIdx, 1);
  const lastDay = new Date(year, monthIdx + 1, 0);
  const totalDays = lastDay.getDate();

  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const miniGridCells: Array<{ dayNum: number; dateStr?: string; isCurrentMonth: boolean; hasEvents: boolean; isSelected: boolean }> = [];

  const prevMonthLastDay = new Date(year, monthIdx, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    miniGridCells.push({ dayNum: prevMonthLastDay - i, isCurrentMonth: false, hasEvents: false, isSelected: false });
  }

  for (let d = 1; d <= totalDays; d++) {
    const formattedD = d < 10 ? `0${d}` : `${d}`;
    const dateStr = `${selectedMonth}-${formattedD}`;
    const hasEvents = Boolean(eventsMap && eventsMap[dateStr] && eventsMap[dateStr].length > 0);
    const isSelected = Boolean(dateStr === selectedDate);
    miniGridCells.push({ dayNum: d, dateStr, isCurrentMonth: true, hasEvents, isSelected });
  }


  const remaining = 35 - miniGridCells.length;
  if (remaining > 0) {
    for (let i = 1; i <= remaining; i++) {
      miniGridCells.push({ dayNum: i, isCurrentMonth: false, hasEvents: false, isSelected: false });
    }
  }

  return (
    <div className="w-full flex flex-col gap-6 select-none">

      {/* Mini Calendar Card */}
      <div className="bg-[#0a0a0a] border border-neutral-900 rounded-2xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-white tracking-wide">{currentMonthYearStr}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevMonth}
              className="p-1.5 rounded-lg bg-[#141414] hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onNextMonth}
              className="p-1.5 rounded-lg bg-[#141414] hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-neutral-500 mb-2">
          {miniDaysOfWeek.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold">
          {miniGridCells.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (item.isCurrentMonth && item.dayNum) {
                  onDateSelect(item.dayNum);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 cursor-pointer hover:opacity-80 transition-opacity ${
                !item.isCurrentMonth ? 'opacity-30' : 'opacity-100'
              }`}
            >
              <span
                className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                  item.isSelected
                    ? 'bg-[#be0919] text-white shadow-md' // Red circle for selected current date
                    : 'text-neutral-300'
                }`}
              >
                {item.dayNum}
              </span>
              {item.hasEvents && !item.isSelected && (
                <span className="w-1 h-1 rounded-full bg-[#be0919] mt-0.5 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Task Widget */}
      <div className="bg-[#0a0a0a] border border-neutral-900 rounded-2xl p-5 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-900 mb-4">
          <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">Upcoming Task</h3>
          <span className="px-2 py-0.5 bg-red-950/80 text-red-400 border border-red-800/40 text-[10px] font-bold rounded-md">
            {upcomingTasks.length > 0 ? `${upcomingTasks.length} New` : '0 New'}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {upcomingTasks.slice(0, 4).map((t, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-neutral-900/60 last:border-b-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#be0919] shrink-0" />
                <span className="text-neutral-200 font-medium truncate">{t.title}</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono shrink-0">{t.dueDate}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Absenteeism Widget */}
      <div className="bg-[#0a0a0a] border border-neutral-900 rounded-2xl p-5 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-500 shrink-0">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Employee Absenteeism</h4>
            <span className="text-[10px] text-neutral-400 font-light block mt-0.5">
              {absenteeism.absentCount} employee absent this month
            </span>
          </div>
        </div>

        <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden mb-2">
          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${absenteeism.percentage}%` }} />
        </div>

        <div className="flex justify-end">
          <button
            onClick={onViewAbsenteeismClick}
            className="text-[10px] text-red-500 font-bold hover:underline bg-transparent cursor-pointer"
          >
            View Detail
          </button>
        </div>

      </div>

      {/* Leave Requests Widget */}
      <div className="bg-[#0a0a0a] border border-neutral-900 rounded-2xl p-5 shadow-md flex flex-col gap-4">
        <div className="pb-3 border-b border-neutral-900">
          <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">Leave Requests</h3>
        </div>

        <div className="flex flex-col gap-3">
          {leaveRequests.map((l, idx) => {
            const isApproved = l.status === 'APPROVED';
            const isUnapproved = l.status === 'UNAPPROVED' || l.status === 'REJECTED';
            const isPending = l.status === 'PENDING';

            let badgeStyle = 'bg-amber-950/60 text-amber-400 border-amber-800/40';
            if (isApproved) badgeStyle = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40';
            if (isUnapproved) badgeStyle = 'bg-red-950/60 text-red-400 border-red-800/40';

            return (
              <div key={idx} className="bg-[#050505] border border-neutral-900 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400 shrink-0">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{l.type}</span>
                    <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">{l.dates}</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${badgeStyle}`}>
                  {l.status}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={onRequestLeaveClick}
          className="w-full py-3 bg-[#be0919] hover:bg-[#990714] text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md mt-2"
        >
          Request Leave
        </button>
      </div>

    </div>
  );
}
