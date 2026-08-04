import React from 'react';
import { Calendar, CheckSquare, Loader2, AlertTriangle } from 'lucide-react';

interface TaskStatsCardsProps {
  stats: {
    total: number;
    completed: number;
    ongoing: number;
    overdue: number;
  };
  layout?: 'cards-only' | 'circle-only';
}

export default function TaskStatsCards({ stats, layout }: TaskStatsCardsProps) {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

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
      <div className="bg-transparent flex flex-col items-center justify-center relative w-44 h-44 shrink-0">
        {/* Dynamic gauge circle */}
        <div className="relative w-36 h-36 flex items-center justify-center">
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
            <span className="text-[9px] text-neutral-400 tracking-wider block">Today's Progress</span>
            <span className="text-[22px] font-normal text-white block leading-none">{completionRate}%</span>
            <span className="text-[9px] text-neutral-500 font-light block">Task completed</span>
          </div>
        </div>
      </div>
    );
  }

  // default or cards-only
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full justify-center">
      {/* Assigned Tasks Card */}
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:border-neutral-800 transition-all duration-300 shadow-md aspect-square w-full max-w-[130px] mx-auto">
        <div className="p-2 bg-[#be0919]/10 rounded-lg text-[#be0919] mb-2">
          <Calendar className="w-5 h-5" />
        </div>
        <span className="text-xl font-normal text-white leading-none mb-1.5">{stats.total}</span>
        <span className="text-[10px] text-neutral-450 font-light block">Tasks Assigned</span>
      </div>

      {/* Tasks Completed Card */}
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:border-neutral-800 transition-all duration-300 shadow-md aspect-square w-full max-w-[130px] mx-auto">
        <div className="p-2 bg-[#be0919]/10 rounded-lg text-[#be0919] mb-2">
          <CheckSquare className="w-5 h-5" />
        </div>
        <span className="text-xl font-normal text-white leading-none mb-1.5">{stats.completed}</span>
        <span className="text-[10px] text-neutral-450 font-light block">Tasks Completed</span>
      </div>

      {/* In Progress Card */}
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:border-neutral-800 transition-all duration-300 shadow-md aspect-square w-full max-w-[130px] mx-auto">
        <div className="p-2 bg-[#be0919]/10 rounded-lg text-[#be0919] mb-2">
          <Loader2 className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <span className="text-xl font-normal text-white leading-none mb-1.5">{stats.ongoing}</span>
        <span className="text-[10px] text-neutral-450 font-light block">In Progress</span>
      </div>

      {/* Overdue Tasks Card */}
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:border-neutral-800 transition-all duration-300 shadow-md aspect-square w-full max-w-[130px] mx-auto">
        <div className="p-2 bg-[#be0919]/10 rounded-lg text-[#be0919] mb-2">
          <AlertTriangle className="w-5 h-5 text-[#be0919]" />
        </div>
        <span className="text-xl font-normal text-white leading-none mb-1.5">{stats.overdue}</span>
        <span className="text-[10px] text-neutral-450 font-light block">Overdue Tasks</span>
      </div>
    </div>
  );
}
