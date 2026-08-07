'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface PerformanceAlert {
  id: string;
  title: string;
  timestamp: string;
}

interface AdminPerformanceAlertsProps {
  alerts?: PerformanceAlert[];
}

export default function AdminPerformanceAlerts({ alerts = [] }: AdminPerformanceAlertsProps) {


  return (
    <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-6 sm:p-7 shadow-sm animate-fadeIn flex flex-col justify-between select-none">
      <div className="mb-6 pb-4 border-b border-neutral-900">
        <h3 className="text-base sm:text-lg font-bold tracking-wide text-white">Performance Alert</h3>
      </div>

      <div className="relative pl-10 space-y-6 my-auto">
        {/* Vertical Connecting Line */}
        <div className="absolute left-[15px] top-3 bottom-3 w-[1.5px] bg-[#be0919]/40" />

        {alerts.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-500 font-light">
            No recent system alerts.
          </div>
        ) : (
          alerts.map((alert, idx) => (
            <div key={alert.id || idx} className="relative flex items-center justify-between gap-4">
              {/* Timeline Dot / Icon */}
              <div className="absolute -left-[36px] top-1/2 -translate-y-1/2 p-1.5 bg-[#180608] border border-[#be0919] rounded-full text-[#be0919] shrink-0 z-10 shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-semibold text-white block leading-snug tracking-wide whitespace-normal">
                  {alert.title}
                </span>
              </div>

              <span className="text-[11px] text-neutral-400 font-light shrink-0 whitespace-nowrap pl-2">
                {alert.timestamp}
              </span>
            </div>
          ))
        )}

      </div>

    </div>
  );
}
