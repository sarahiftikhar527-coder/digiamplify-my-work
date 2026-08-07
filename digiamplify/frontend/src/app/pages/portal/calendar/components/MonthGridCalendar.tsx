'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface MonthGridCalendarProps {
  currentMonthYearStr: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSetAvailabilityClick: () => void;
  onDateClick: (dayNum: number) => void;
  onMoreClick?: (dateStr: string, events: any[]) => void;
  eventsMap: { [dateStr: string]: any[] };
  selectedMonth: string; // YYYY-MM e.g. "2026-07"
  selectedDate?: string; // YYYY-MM-DD e.g. "2026-07-13"
  viewMode: 'Month' | 'Day';
  setViewMode: (val: 'Month' | 'Day') => void;
}

export default function MonthGridCalendar({
  currentMonthYearStr,
  onPrevMonth,
  onNextMonth,
  onSetAvailabilityClick,
  onDateClick,
  onMoreClick,
  eventsMap,
  selectedMonth,
  selectedDate,
  viewMode,
  setViewMode
}: MonthGridCalendarProps) {
  const [hoveredDate, setHoveredDate] = React.useState<string | null>(null);
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Calculate days for the month grid
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;

  const firstDayOfMonth = new Date(year, monthIdx, 1);
  const lastDayOfMonth = new Date(year, monthIdx + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  // Get starting day index (Mon=0, Tue=1, ..., Sun=6)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday is 6

  const gridCells: Array<{ dayNum?: number; dateStr?: string; isCurrentMonth: boolean; colIndex: number }> = [];

  // Padding previous month days
  const prevMonthLastDay = new Date(year, monthIdx, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const colIndex = (startDayOfWeek - 1 - i) % 7;
    gridCells.push({ dayNum: prevMonthLastDay - i, isCurrentMonth: false, colIndex });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const formattedD = d < 10 ? `0${d}` : `${d}`;
    const dateStr = `${selectedMonth}-${formattedD}`;
    const colIndex = (gridCells.length) % 7;
    gridCells.push({ dayNum: d, dateStr, isCurrentMonth: true, colIndex });
  }

  // Padding next month days to complete grid multiples of 7
  const remainingCells = 35 - gridCells.length;
  if (remainingCells > 0) {
    for (let i = 1; i <= remainingCells; i++) {
      const colIndex = (gridCells.length) % 7;
      gridCells.push({ dayNum: i, isCurrentMonth: false, colIndex });
    }
  }

  return (
    <div className="w-full flex flex-col gap-5 select-none">

      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-4 sm:p-5">
        
        {/* Navigation & Month Picker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevMonth}
              className="p-2 rounded-lg bg-[#141414] border border-neutral-800 hover:bg-neutral-800 text-neutral-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNextMonth}
              className="p-2 rounded-lg bg-[#141414] border border-neutral-800 hover:bg-neutral-800 text-neutral-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <button className="flex items-center gap-2 text-base sm:text-lg font-bold text-white tracking-wide bg-transparent cursor-pointer py-1 px-2 hover:opacity-80">
              <span>{currentMonthYearStr}</span>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Action Button & View Filter */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSetAvailabilityClick}
            className="px-5 py-2.5 bg-[#be0919] hover:bg-[#990714] text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-[0_2px_10px_rgba(190,9,25,0.3)]"
          >
            Set Availability
          </button>

          <div className="relative">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'Month' | 'Day')}
              className="appearance-none bg-[#141414] border border-neutral-800 text-white text-xs sm:text-sm font-semibold rounded-xl py-2.5 px-4 pr-8 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="Month">Month</option>
              <option value="Day">Day</option>
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center gap-6 sm:gap-8 bg-[#0c0c0c] border border-neutral-900 rounded-2xl px-6 py-3 text-xs font-semibold text-neutral-300">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#be0919]" />
          <span>Task View</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#525252]" />
          <span>Weekend (Sat-Sun)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span>Event</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          <span>Holiday</span>
        </div>
      </div>

      {/* 7-Column Month Grid Table with Responsive Horizontal Scroll */}
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
        <div className="min-w-[650px] xl:min-w-0">
          
          {/* Table Day Headers */}
          <div className="grid grid-cols-7 border-b border-neutral-900 text-center font-bold text-xs uppercase tracking-wider">
            {daysOfWeek.map((day, idx) => {
              const isThu = day === 'Thu';
              const isWeekend = day === 'Sat' || day === 'Sun';
              return (
                <div
                  key={day}
                  className={`py-3.5 border-r border-neutral-900 last:border-r-0 ${
                    isThu
                      ? 'bg-[#be0919] text-white font-extrabold'
                      : isWeekend
                      ? 'bg-[#181818] text-neutral-400 font-bold'
                      : 'text-neutral-300 bg-[#050505]/60'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Month Days Cells Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-y divide-neutral-900">
            {gridCells.map((cell, idx) => {
              const cellEvents = cell.dateStr && eventsMap[cell.dateStr] ? eventsMap[cell.dateStr] : [];
              const isThuColumn = cell.colIndex === 3;
              const isWeekendColumn = cell.colIndex === 5 || cell.colIndex === 6;
              const isHovered = cell.dateStr && hoveredDate === cell.dateStr;
              const isSelected = Boolean(cell.isCurrentMonth && cell.dateStr && cell.dateStr === selectedDate);

              return (
                <div
                  key={idx}
                  onMouseEnter={() => cell.isCurrentMonth && cell.dateStr && setHoveredDate(cell.dateStr)}
                  onMouseLeave={() => setHoveredDate(null)}
                  onClick={() => {
                    if (cell.isCurrentMonth && cell.dayNum) {
                      onDateClick(cell.dayNum);
                    }
                  }}
                  className={`h-[130px] p-2 sm:p-2.5 border-r border-neutral-900 last:border-r-0 flex flex-col justify-start gap-1.5 transition-all relative cursor-pointer overflow-hidden ${
                    isSelected
                      ? 'bg-[#2b080c] border-[#be0919] z-20 ring-1 ring-[#be0919]' // Red active cell highlight
                      : isHovered && cell.isCurrentMonth
                      ? 'bg-[#220a0f] border-red-500/50 shadow-2xl z-30 ring-1 ring-red-500/40'
                      : isThuColumn && cell.isCurrentMonth
                      ? 'bg-[#180709]/80 text-white'
                      : isWeekendColumn && cell.isCurrentMonth
                      ? 'bg-[#141414]/90 text-neutral-300' // Weekend column grey tint
                      : !cell.isCurrentMonth
                      ? 'bg-[#050505]/40 text-neutral-600'
                      : 'bg-[#0c0c0c] text-white'
                  }`}
                >
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#be0919] text-white shadow-md'
                        : !cell.isCurrentMonth
                        ? 'text-neutral-600'
                        : 'text-white'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {cell.isCurrentMonth && cellEvents.length > 0 && (
                    <div className="flex flex-col gap-1 w-full overflow-hidden">
                      {cellEvents.slice(0, 2).map((evt, eIdx) => {
                        const isAbsent = evt.color === 'orange' || evt.type === 'Absent';
                        const isHoliday = evt.color === 'blue' || evt.type === 'Holiday';

                        let badgeBg = 'bg-[#2a080c] border-[#be0919]/60 text-white';
                        let dotBg = 'bg-[#be0919]';

                        if (isAbsent) {
                          badgeBg = 'bg-[#2d1a08] border-amber-600/60 text-white';
                          dotBg = 'bg-amber-500';
                        } else if (isHoliday) {
                          badgeBg = 'bg-[#081e2e] border-sky-600/60 text-white';
                          dotBg = 'bg-sky-400';
                        }

                        return (
                          <div
                            key={eIdx}
                            className={`px-1.5 py-1 rounded-lg border text-[10px] font-semibold flex items-center gap-1.5 leading-tight w-full overflow-hidden shrink-0 ${badgeBg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotBg}`} />
                            <span className="truncate w-full">{evt.title}</span>
                          </div>
                        );
                      })}

                      {cellEvents.length > 2 && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (cell.dateStr && onMoreClick) {
                              onMoreClick(cell.dateStr, cellEvents);
                            }
                          }}
                          className="px-1.5 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors w-fit shrink-0 mt-0.5 cursor-pointer"
                        >
                          +{cellEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  )}



                  {/* Floating Date Detail Popover Card on Hover */}
                  {isHovered && cell.isCurrentMonth && (
                    <div className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-60 bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.9)] z-50 animate-fadeIn pointer-events-none">
                      <div className="pb-2 border-b border-neutral-800 mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-white tracking-wide">
                          {cell.dayNum} {currentMonthYearStr}
                        </span>
                        <span className="text-[10px] text-[#be0919] font-bold uppercase tracking-wider">Detail</span>
                      </div>

                      {cellEvents.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {cellEvents.map((evt, eIdx) => (
                            <div key={eIdx} className="flex items-center gap-2 text-xs">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  evt.color === 'orange' ? 'bg-amber-500' : evt.color === 'blue' ? 'bg-sky-400' : 'bg-[#be0919]'
                                }`}
                              />
                              <span className="text-white font-medium truncate">{evt.title}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 font-light block">No scheduled events</span>
                      )}

                      <div className="mt-3 pt-2 border-t border-neutral-900 text-[10px] text-neutral-500 font-mono text-center">
                        Click to view 24h timeline
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      </div>


    </div>
  );
}

