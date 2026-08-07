'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Moon, Users, Clock } from 'lucide-react';

interface DayScheduleViewProps {
  dateStr: string; // e.g. "13 July 2026, Monday"
  onBack: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  scheduleData: any;
}

export default function DayScheduleView({
  dateStr,
  onBack,
  onPrevDay,
  onNextDay,
  scheduleData
}: DayScheduleViewProps) {
  const timeSlots = [
    '12:00 AM',
    '02:00 AM',
    '04:00 AM',
    '06:00 AM',
    '08:00 AM',
    '10:00 AM',
    '12:00 PM',
    '02:00 PM',
    '04:00 PM',
    '06:00 PM',
    '08:00 PM',
    '10:00 PM',
    '12:00 AM'
  ];

  const metrics = scheduleData?.metrics || {
    workShift: '09:00 AM - 06:00 PM',
    workingHours: '09h 00m',
    breakTime: '01:00 PM - 02:00 PM',
    breakHours: '01h 00m',
    clockIn: '09:00 AM',
    clockInStatus: 'On Time',
    clockOut: '06:00 PM',
    clockOutStatus: 'On Time'
  };

  const timelineItems = scheduleData?.timelineItems || [
    { id: '1', startTime: '09:00 AM', endTime: '09:30 AM', title: 'Daily startup meeting', location: 'Meeting Room 1', attendees: 8, category: 'EVENT' },
    { id: '2', startTime: '08:00 AM', endTime: '09:30 AM', title: 'Redesign dashboard', location: 'Design Team', attendees: 8, category: 'TASK' },
    { id: '3', startTime: '09:00 AM', endTime: '09:30 AM', title: 'Daily startup meeting', location: 'Meeting Room 1', attendees: 8, category: 'EVENT' },
    { id: '4', startTime: '09:00 AM', endTime: '09:30 AM', title: 'Daily startup meeting', location: 'Meeting Room 1', attendees: 8, category: 'EVENT' },
    { id: '5', startTime: '08:00 AM', endTime: '09:30 AM', title: 'Lunch Break', location: 'Break', attendees: 0, category: 'BREAK' },
    { id: '6', startTime: '09:00 AM', endTime: '09:30 AM', title: 'Redesign dashboard', location: 'Design Team', attendees: 8, category: 'TASK' },
    { id: '7', startTime: '09:00 AM', endTime: '09:30 AM', title: 'Redesign dashboard', location: 'Design Team', attendees: 8, category: 'TASK' },
    { id: '8', startTime: '08:00 AM', endTime: '09:30 AM', title: 'Review and feedback', location: 'Meeting Room 1', attendees: 8, category: 'EVENT' }
  ];

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn select-none">

      {/* Top Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#be0919] hover:bg-[#990714] text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevDay}
              className="p-2 rounded-lg bg-[#141414] hover:bg-neutral-800 text-neutral-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={onNextDay}
              className="p-2 rounded-lg bg-[#141414] hover:bg-neutral-800 text-neutral-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
            {dateStr}
          </h2>
        </div>
      </div>

      {/* 4 Shift Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        
        {/* Work Shift Card */}
        <div className="bg-[#0a0a0a] border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <span className="text-xs text-neutral-400 font-medium block">Work Shift</span>
          <span className="text-xs font-semibold text-neutral-300 mt-1 block">{metrics.workShift}</span>
          <div className="mt-4 pt-3 border-t border-neutral-900 flex justify-between items-center text-xs">
            <span className="font-bold text-white">{metrics.workingHours}</span>
            <span className="text-[10px] text-neutral-500 font-light">Total working hours</span>
          </div>
        </div>

        {/* Break Time Card */}
        <div className="bg-[#0a0a0a] border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <span className="text-xs text-amber-500 font-medium block">Break Time</span>
          <span className="text-xs font-semibold text-neutral-300 mt-1 block">{metrics.breakTime}</span>
          <div className="mt-4 pt-3 border-t border-neutral-900 flex justify-between items-center text-xs">
            <span className="font-bold text-white">{metrics.breakHours}</span>
            <span className="text-[10px] text-neutral-500 font-light">Total breaktime hours</span>
          </div>
        </div>

        {/* Clock In Card */}
        <div className="bg-[#0a0a0a] border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <span className="text-xs text-emerald-500 font-medium block">Clock In</span>
          <span className="text-lg font-bold text-white mt-1 block">{metrics.clockIn}</span>
          <div className="mt-3">
            <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full">
              {metrics.clockInStatus}
            </span>
          </div>
        </div>

        {/* Clock Out Card */}
        <div className="bg-[#0a0a0a] border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <span className="text-xs text-amber-500 font-medium block">Clock Out</span>
          <span className="text-lg font-bold text-white mt-1 block">{metrics.clockOut}</span>
          <div className="mt-3">
            <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full">
              {metrics.clockOutStatus}
            </span>
          </div>
        </div>

      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center gap-5 sm:gap-8 bg-[#0a0a0a] border border-neutral-900 rounded-2xl px-6 py-3.5 text-xs font-semibold text-neutral-300">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#be0919]" />
          <span>Task View</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-500" />
          <span>Weekend</span>
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

      {/* 24-Hour Timeline Container */}
      <div className="bg-[#0a0a0a] border border-neutral-900 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl relative">
        
        {/* Free Time Card */}
        <div className="bg-[#0f141d] border border-sky-950/40 rounded-2xl p-6 flex items-center gap-4 text-white">
          <div className="p-3 bg-sky-950/60 rounded-xl text-sky-400">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold tracking-wide text-white">Free time</h4>
            <span className="text-xs text-neutral-400 font-light mt-1 block">12:00 AM - 08:00 AM</span>
          </div>
        </div>

        {/* Clock In Marker */}
        <div className="flex items-center gap-4 relative">
          <span className="w-20 text-xs font-bold text-emerald-400 shrink-0">09:00 AM</span>
          <div className="flex-1 h-[1px] bg-emerald-500/50" />
          <span className="px-3 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold rounded-md uppercase">
            Clock In
          </span>
        </div>

        {/* Timeline Items */}
        <div className="flex flex-col gap-3 pl-0 sm:pl-20">
          {timelineItems.map((item: any, idx: number) => {
            const isEvent = item.category === 'EVENT';
            const isTask = item.category === 'TASK';
            const isBreak = item.category === 'BREAK';

            let cardBg = 'bg-[#120d18] border-purple-900/40 text-purple-200';
            if (isTask) cardBg = 'bg-[#1a1209] border-amber-900/40 text-amber-200';
            if (isBreak) cardBg = 'bg-[#0d0d0d] border-neutral-800 text-neutral-300';

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 shadow-sm hover:border-neutral-700 transition-colors ${cardBg}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-black/40 text-neutral-300">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 font-mono block">{item.startTime} - {item.endTime}</span>
                    <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">{item.title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-neutral-400 font-medium">
                  <span>{item.location}</span>
                  {item.attendees > 0 && (
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <Users className="w-3.5 h-3.5" />
                      <span>{item.attendees}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Clock Out Marker */}
        <div className="flex items-center gap-4 relative mt-4">
          <span className="w-20 text-xs font-bold text-amber-400 shrink-0">09:00 PM</span>
          <div className="flex-1 h-[1px] bg-amber-500/50" />
          <span className="px-3 py-1 bg-amber-950/80 text-amber-400 border border-amber-500/40 text-[10px] font-bold rounded-md uppercase">
            Clock Out
          </span>
        </div>

      </div>

    </div>
  );
}
