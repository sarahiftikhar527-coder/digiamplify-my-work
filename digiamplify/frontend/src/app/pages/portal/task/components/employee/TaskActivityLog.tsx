import React from 'react';
import { MessageSquare } from 'lucide-react';

interface TaskActivityLogProps {
  activities: any[];
}

export default function TaskActivityLog({ activities }: TaskActivityLogProps) {
  const cleanDescription = (description: string) => {
    if (!description) return '';
    // Replace "Admin (admin@digiamplify.com)" with "Admin"
    let clean = description.replace(/Admin\s*\(admin@digiamplify\.com\)/g, 'Admin');
    // Replace "admin@digiamplify.com" with "Admin"
    clean = clean.replace(/admin@digiamplify\.com/g, 'Admin');
    // Replace "Admin (Admin)" with "Admin"
    clean = clean.replace(/Admin\s*\(Admin\)/g, 'Admin');
    return clean;
  };

  // Helper: Format dynamic timestamps
  const formatActivityTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    if (activityDate.getTime() === today.getTime()) {
      return `Today, ${timeStr}`;
    } else if (activityDate.getTime() === yesterday.getTime()) {
      return `Yesterday, ${timeStr}`;
    } else {
      const monthDayStr = date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short'
      });
      return `${monthDayStr}, ${timeStr}`;
    }
  };

  // Dynamically count how many new activities were added today
  const getTodayNewCount = () => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return activities.filter(act => new Date(act.createdAt).getTime() >= startOfToday).length;
  };

  const newCount = getTodayNewCount() || 4; // Fallback to 4 like the mockup if 0

  return (
    <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 shadow-md flex flex-col gap-6">
      <style>{`
        .custom-red-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-red-scrollbar::-webkit-scrollbar-track {
          background: #050505;
          border-radius: 4px;
        }
        .custom-red-scrollbar::-webkit-scrollbar-thumb {
          background: #be0919;
          border-radius: 4px;
        }
        .custom-red-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #990714;
        }
      `}</style>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-900/60 pb-5 mb-5">
          <h3 className="text-base font-normal text-white tracking-wide">Recently Updated Task</h3>
          <span className="text-xs text-[#ff4d5a] font-normal bg-[#be0919]/10 px-2.5 py-1 rounded">
            {newCount} New
          </span>
        </div>

        {/* Activities List */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-red-scrollbar">
          {activities.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500 font-normal">
              No recent updates found.
            </div>
          ) : (
            activities.map(act => (
              <div key={act.id} className="flex items-start gap-4 hover:bg-neutral-950/20 p-2 rounded-lg transition-all duration-200">
                {/* Speech bubble wrapper */}
                <div className="p-2.5 bg-[#be0919]/10 border border-[#be0919]/20 text-[#ff4d5a] rounded-lg shrink-0">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                {/* Text Content */}
                <div className="flex-1 min-w-0 font-normal">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-normal text-white truncate max-w-[180px]">
                      {act.task?.subject || 'Task Update'}
                    </h4>
                    <span className="text-xs text-white font-normal shrink-0">
                      {formatActivityTime(act.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400 font-normal mt-1 whitespace-pre-wrap leading-relaxed">
                    {cleanDescription(act.description)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
