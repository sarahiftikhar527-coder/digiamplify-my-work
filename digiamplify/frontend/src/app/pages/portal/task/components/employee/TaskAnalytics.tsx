import React, { useState } from 'react';
import { Calendar, CheckSquare, AlertCircle } from 'lucide-react';

interface TaskAnalyticsProps {
  tasks: any[];
}

export default function TaskAnalytics({ tasks }: TaskAnalyticsProps) {
  const [timeframe, setTimeframe] = useState<'Week' | 'Month' | 'Year'>('Week');

  // Filter tasks based on timeframe (simulated or actual)
  const getFilteredTasksByTimeframe = () => {
    const now = new Date();
    return tasks.filter(task => {
      const taskDate = new Date(task.updatedAt || task.createdAt);
      const diffTime = now.getTime() - taskDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (timeframe === 'Week') return diffDays <= 7;
      if (timeframe === 'Month') return diffDays <= 30;
      return diffDays <= 365; // 'Year'
    });
  };

  const currentTasks = getFilteredTasksByTimeframe();
  const totalCount = currentTasks.length;

  const completed = currentTasks.filter(t => t.status.toUpperCase() === 'COMPLETED' || t.status.toUpperCase() === 'FINISHED').length;
  const ongoing = currentTasks.filter(t => t.status.toUpperCase() === 'ONGOING' || t.status.toUpperCase() === 'PENDING').length;
  const delayed = currentTasks.filter(t => t.status.toUpperCase() === 'DELAYED').length;
  const cancelled = currentTasks.filter(t => t.status.toUpperCase() === 'CANCELLED').length;

  // Calculate percentages
  const getPct = (count: number) => {
    if (totalCount === 0) return 0;
    return Math.round((count / totalCount) * 100);
  };

  const completedPct = getPct(completed);
  const ongoingPct = getPct(ongoing);
  const delayedPct = getPct(delayed);
  const cancelledPct = getPct(cancelled);

  // Today's Stats calculations (specifically for tasks due today)
  const todayObj = new Date();
  const yyyy = todayObj.getFullYear();
  const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
  const dd = String(todayObj.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const todayTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    return t.dueDate.substring(0, 10) === todayStr;
  });
  const todayTotal = todayTasks.length;
  const todayCompleted = todayTasks.filter(t => t.status.toUpperCase() === 'COMPLETED' || t.status.toUpperCase() === 'FINISHED').length;
  const todayPending = todayTotal - todayCompleted;

  // SVG calculations for Doughnut
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius; // 314.16

  // Cumulative stroke offsets
  const completedOffset = 0;
  const ongoingOffset = -((completedPct / 100) * circumference);
  const delayedOffset = -(((completedPct + ongoingPct) / 100) * circumference);
  const cancelledOffset = -(((completedPct + ongoingPct + delayedPct) / 100) * circumference);

  const overallCompletionRate = currentTasks.length > 0
    ? Math.round((currentTasks.filter(t => t.status.toUpperCase() === 'COMPLETED' || t.status.toUpperCase() === 'FINISHED').length / currentTasks.length) * 100)
    : 0;

  return (
    <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 shadow-md flex flex-col gap-5">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-normal text-white tracking-wide">Task Analytics</h3>
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="bg-[#050505] border border-neutral-900 text-neutral-300 text-xs font-normal rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:border-neutral-700 transition-all"
            >
              <option value="Week">Week</option>
              <option value="Month">Month</option>
              <option value="Year">Year</option>
            </select>
          </div>
        </div>

        {/* Doughnut Chart Content */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 py-4 border-b border-neutral-900/60 pb-6 mb-1">
          {/* SVG Doughnut (Moved slightly right and made compact) */}
          <div className="relative w-40 h-40 flex items-center justify-center shrink-0 ml-4">
            {totalCount === 0 ? (
              <div className="w-full h-full rounded-full border-8 border-neutral-850" />
            ) : (
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
                {/* Completed (Green) */}
                {completedPct > 0 && (
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-emerald-500 fill-none"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${(completedPct / 100) * circumference} ${circumference}`}
                    strokeDashoffset={completedOffset}
                  />
                )}
                {/* Ongoing (Red) */}
                {ongoingPct > 0 && (
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-[#be0919] fill-none"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${(ongoingPct / 100) * circumference} ${circumference}`}
                    strokeDashoffset={ongoingOffset}
                  />
                )}
                {/* Delayed (Yellow/Orange) */}
                {delayedPct > 0 && (
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-amber-500 fill-none"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${(delayedPct / 100) * circumference} ${circumference}`}
                    strokeDashoffset={delayedOffset}
                  />
                )}
                {/* Cancelled (Purple) */}
                {cancelledPct > 0 && (
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-purple-500 fill-none"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${(cancelledPct / 100) * circumference} ${circumference}`}
                    strokeDashoffset={cancelledOffset}
                  />
                )}
              </svg>
            )}

            {/* Inner Center Text (White & Non-bold, sized to fit) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none space-y-0.5">
              <span className="text-2xl font-normal text-white">{overallCompletionRate}%</span>
              <span className="text-[10px] font-normal text-white block">Task completed</span>
            </div>
          </div>

          {/* Legends (Squares, tighter columns to prevent overlaps) */}
          <div className="flex-1 w-full space-y-2.5">
            {/* Completed */}
            <div className="flex items-center justify-between text-xs font-normal">
              <div className="flex items-center gap-1.5 w-20 shrink-0">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 shrink-0" />
                <span className="text-neutral-400 font-light">Completed</span>
              </div>
              <div className="flex items-center justify-end gap-2 flex-1">
                <span className="text-white font-normal w-5 text-right">{completed}</span>
                <span className="text-neutral-500 text-[10px] font-light w-10 text-right">({completedPct}%)</span>
              </div>
            </div>

            {/* Ongoing */}
            <div className="flex items-center justify-between text-xs font-normal">
              <div className="flex items-center gap-1.5 w-20 shrink-0">
                <span className="w-3 h-3 rounded-sm bg-[#be0919] shrink-0" />
                <span className="text-neutral-400 font-light">Ongoing</span>
              </div>
              <div className="flex items-center justify-end gap-2 flex-1">
                <span className="text-white font-normal w-5 text-right">{ongoing}</span>
                <span className="text-neutral-500 text-[10px] font-light w-10 text-right">({ongoingPct}%)</span>
              </div>
            </div>

            {/* Delayed */}
            <div className="flex items-center justify-between text-xs font-normal">
              <div className="flex items-center gap-1.5 w-20 shrink-0">
                <span className="w-3 h-3 rounded-sm bg-amber-500 shrink-0" />
                <span className="text-neutral-400 font-light">Delayed</span>
              </div>
              <div className="flex items-center justify-end gap-2 flex-1">
                <span className="text-white font-normal w-5 text-right">{delayed}</span>
                <span className="text-neutral-500 text-[10px] font-light w-10 text-right">({delayedPct}%)</span>
              </div>
            </div>

            {/* Cancelled */}
            <div className="flex items-center justify-between text-xs font-normal">
              <div className="flex items-center gap-1.5 w-20 shrink-0">
                <span className="w-3 h-3 rounded-sm bg-purple-500 shrink-0" />
                <span className="text-neutral-400 font-light">Cancelled</span>
              </div>
              <div className="flex items-center justify-end gap-2 flex-1">
                <span className="text-white font-normal w-5 text-right">{cancelled}</span>
                <span className="text-neutral-500 text-[10px] font-light w-10 text-right">({cancelledPct}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks Breakdown Footer Card exactly according to design with white border and vertical lines */}
      <div className="bg-[#050505] border border-white/20 rounded-xl p-5 px-2 shadow-inner mt-1">
        <div className="grid grid-cols-3 divide-x divide-white/20 text-center">
          {/* Today's Tasks */}
          <div className="flex flex-col items-center justify-center font-normal pl-1 pr-2">
            <div className="flex items-center gap-1.5 text-xs text-white font-normal mb-2 whitespace-nowrap">
              <Calendar className="w-4 h-4 text-[#be0919] shrink-0" />
              <span>Today's Task</span>
            </div>
            <span className="text-xl font-normal text-white mt-1">{todayTotal}</span>
          </div>

          {/* Completed */}
          <div className="flex flex-col items-center justify-center font-normal pl-2.5 pr-2">
            <div className="flex items-center gap-1.5 text-xs text-white font-normal mb-2 whitespace-nowrap">
              {/* Double checkmarks SVG icon */}
              <svg className="w-4 h-4 text-[#be0919] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17l4 4L23 11" opacity="0.8" />
              </svg>
              <span>Completed</span>
            </div>
            <span className="text-xl font-normal text-white mt-1">{todayCompleted}</span>
          </div>

          {/* Pending */}
          <div className="flex flex-col items-center justify-center font-normal pl-1 pr-1">
            <div className="flex items-center gap-1.5 text-xs text-white font-normal mb-2 whitespace-nowrap">
              <AlertCircle className="w-4 h-4 text-[#be0919] shrink-0" />
              <span>Pending</span>
            </div>
            <span className="text-xl font-normal text-white mt-1">{todayPending}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
