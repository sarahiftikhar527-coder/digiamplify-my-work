import React, { useState } from 'react';

interface PriorityBreakdownProps {
  tasks: any[];
}

export default function PriorityBreakdown({ tasks }: PriorityBreakdownProps) {
  const [timeframe, setTimeframe] = useState<'Week' | 'Month' | 'Year'>('Week');

  // Filter tasks based on timeframe
  const getFilteredTasks = () => {
    const now = new Date();
    return tasks.filter(task => {
      const taskDate = new Date(task.updatedAt || task.createdAt);
      const diffTime = now.getTime() - taskDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (timeframe === 'Week') return diffDays <= 7;
      if (timeframe === 'Month') return diffDays <= 30;
      return diffDays <= 365;
    });
  };

  const filteredTasks = getFilteredTasks();
  const totalCount = filteredTasks.length;

  const highCount = filteredTasks.filter(t => t.priority.toLowerCase() === 'high').length;
  const mediumCount = filteredTasks.filter(t => t.priority.toLowerCase() === 'medium').length;
  const lowCount = filteredTasks.filter(t => t.priority.toLowerCase() === 'low').length;

  const getPct = (count: number) => {
    if (totalCount === 0) return 0;
    return Math.round((count / totalCount) * 100);
  };

  const highPct = getPct(highCount);
  const mediumPct = getPct(mediumCount);
  const lowPct = getPct(lowCount);

  return (
    <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 shadow-md flex flex-col gap-6">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-900/60 pb-5 mb-6">
          <h3 className="text-base font-normal text-white tracking-wide">Priority Breakdown</h3>
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

        {/* Breakdown progress rows */}
        <div className="space-y-5 py-2">
          {/* High Priority Row */}
          <div className="flex items-center justify-between gap-4 font-normal">
            <div className="flex items-center gap-2.5 w-20 shrink-0">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#ff4d5a] shrink-0" />
              <span className="text-sm font-normal text-neutral-300">High</span>
            </div>
            <div className="flex-1 bg-neutral-900 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#be0919] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${highPct}%` }}
              />
            </div>
            <div className="w-20 text-right shrink-0">
              <span className="text-sm font-normal text-white">
                {highCount} <span className="text-white/65 font-normal text-xs">({highPct}%)</span>
              </span>
            </div>
          </div>

          {/* Medium Priority Row */}
          <div className="flex items-center justify-between gap-4 font-normal">
            <div className="flex items-center gap-2.5 w-20 shrink-0">
              <span className="w-3.5 h-3.5 rounded-sm bg-amber-500 shrink-0" />
              <span className="text-sm font-normal text-neutral-300">Medium</span>
            </div>
            <div className="flex-1 bg-neutral-900 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${mediumPct}%` }}
              />
            </div>
            <div className="w-20 text-right shrink-0">
              <span className="text-sm font-normal text-white">
                {mediumCount} <span className="text-white/65 font-normal text-xs">({mediumPct}%)</span>
              </span>
            </div>
          </div>

          {/* Low Priority Row */}
          <div className="flex items-center justify-between gap-4 font-normal">
            <div className="flex items-center gap-2.5 w-20 shrink-0">
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 shrink-0" />
              <span className="text-sm font-normal text-neutral-300">Low</span>
            </div>
            <div className="flex-1 bg-neutral-900 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${lowPct}%` }}
              />
            </div>
            <div className="w-20 text-right shrink-0">
              <span className="text-sm font-normal text-white">
                {lowCount} <span className="text-white/65 font-normal text-xs">({lowPct}%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
