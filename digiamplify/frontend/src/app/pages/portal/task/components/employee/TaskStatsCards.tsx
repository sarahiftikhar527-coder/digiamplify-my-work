import React from 'react';
import { Calendar, CheckSquare, Loader2, AlertTriangle } from 'lucide-react';

interface TaskStatsCardsProps {
  stats: {
    total: number;
    completed: number;
    ongoing: number;
    overdue: number;
    todayProgress?: number;
  };
  layout?: 'cards-only' | 'circle-only';
}

export default function TaskStatsCards({ stats, layout }: TaskStatsCardsProps) {
  const completionRate = stats.todayProgress !== undefined ? stats.todayProgress : (stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0);

  // Circle / Gauge geometry
  const radius = 45;
  const cx = 55;
  const cy = 55;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius; // ~282.74
  const visibleCircumference = circumference * 0.75; // ~212.06
  const gapCircumference = circumference * 0.25; // ~70.68

  // Dynamic progress length
  const progressLength = (completionRate / 100) * visibleCircumference;

  // Handle dot coordinates calculation
  const angle = 135 + (completionRate / 100) * 270;
  const rad = (angle * Math.PI) / 180;
  const dotX = cx + radius * Math.cos(rad);
  const dotY = cy + radius * Math.sin(rad);

  if (layout === 'circle-only') {
    return (
      <div className="bg-transparent flex flex-col items-center justify-center relative w-48 h-48 shrink-0">
        {/* Dynamic gauge circle */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 110 110">
            {/* Background Track */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              className="stroke-neutral-900 fill-none"
              strokeWidth={strokeWidth}
              strokeDasharray={`${visibleCircumference} ${circumference}`}
              transform={`rotate(135 ${cx} ${cy})`}
              strokeLinecap="round"
            />
            {/* Red Dynamic Progress */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              className="stroke-[#be0919] fill-none transition-all duration-500 ease-out"
              strokeWidth={strokeWidth}
              strokeDasharray={`${progressLength} ${circumference}`}
              transform={`rotate(135 ${cx} ${cy})`}
              strokeLinecap="round"
            />
            {/* Slider white handle dot */}
            <circle
              cx={dotX}
              cy={dotY}
              r="3.5"
              fill="white"
              className="transition-all duration-500 ease-out shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            />
          </svg>

          {/* Text inside the ring (adjusted layout to avoid congestion) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1.5">
            <span className="text-[10px] text-neutral-400 tracking-wider block">Today's Progress</span>
            <span className="text-[26px] font-normal text-white block leading-none">{completionRate}%</span>
            <span className="text-[10px] text-neutral-500 font-light block">Task completed</span>
          </div>
        </div>
      </div>
    );
  }

  // default or cards-only
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
      {/* 1. Task Assign */}
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-4 flex items-center gap-3.5 shadow-sm hover:border-neutral-800 transition-all select-none">
        <div className="p-2.5 bg-[#20080a] border border-[#3d0d12] rounded-xl text-[#be0919] shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-lg sm:text-xl font-bold text-white tracking-wide block leading-none">{stats.total}</span>
          <span className="text-[11px] sm:text-xs text-neutral-400 font-light mt-1.5 block leading-tight">Task Assign</span>
        </div>
      </div>

      {/* 2. Tasks Completed */}
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-4 flex items-center gap-3.5 shadow-sm hover:border-neutral-800 transition-all select-none">
        <div className="p-2.5 bg-[#20080a] border border-[#3d0d12] rounded-xl text-[#be0919] shrink-0">
          <CheckSquare className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-lg sm:text-xl font-bold text-white tracking-wide block leading-none">{stats.completed}</span>
          <span className="text-[11px] sm:text-xs text-neutral-400 font-light mt-1.5 block leading-tight">Tasks Completed</span>
        </div>
      </div>

      {/* 3. In Progress */}
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-4 flex items-center gap-3.5 shadow-sm hover:border-neutral-800 transition-all select-none">
        <div className="p-2.5 bg-[#20080a] border border-[#3d0d12] rounded-xl text-[#be0919] shrink-0">
          <Loader2 className="w-5 h-5 text-[#be0919]" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-lg sm:text-xl font-bold text-white tracking-wide block leading-none">{stats.ongoing}</span>
          <span className="text-[11px] sm:text-xs text-neutral-400 font-light mt-1.5 block leading-tight">In Progress</span>
        </div>
      </div>

      {/* 4. Overdue Tasks */}
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-4 flex items-center gap-3.5 shadow-sm hover:border-neutral-800 transition-all select-none">
        <div className="p-2.5 bg-[#20080a] border border-[#3d0d12] rounded-xl text-[#be0919] shrink-0">
          <AlertTriangle className="w-5 h-5 text-[#be0919]" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-lg sm:text-xl font-bold text-white tracking-wide block leading-none">{stats.overdue}</span>
          <span className="text-[11px] sm:text-xs text-neutral-400 font-light mt-1.5 block leading-tight">Overdue Tasks</span>
        </div>
      </div>
    </div>
  );


}
