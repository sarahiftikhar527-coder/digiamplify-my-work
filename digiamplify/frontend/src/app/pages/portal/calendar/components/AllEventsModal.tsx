'use client';

import React from 'react';
import { X, Calendar, Clock, ArrowRight } from 'lucide-react';

interface AllEventsModalProps {
  dateStr: string; // e.g. "2026-08-06" or "6 August 2026"
  formattedDateHeader: string;
  events: any[];
  onClose: () => void;
  onOpenDayView: () => void;
}

export default function AllEventsModal({
  dateStr,
  formattedDateHeader,
  events,
  onClose,
  onOpenDayView
}: AllEventsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-[#0d0d0d] border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-[#050505]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-950/70 border border-red-800/40 flex items-center justify-center text-[#be0919]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                All Tasks & Events
              </h2>
              <p className="text-xs text-neutral-400 font-light mt-0.5">
                {formattedDateHeader} ({events.length} total)
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

        {/* Events Roster */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {events.length > 0 ? (
            events.map((evt, idx) => {
              const isCompleted = Boolean(evt.isCompleted || evt.status?.toUpperCase() === 'COMPLETED' || evt.color === 'emerald');
              const isAbsent = evt.color === 'orange' || evt.type === 'Absent';
              const isHoliday = evt.color === 'blue' || evt.type === 'Holiday';

              let badgeStyle = 'bg-red-950/60 text-red-400 border-red-800/40';
              let dotBg = 'bg-[#be0919]';

              if (isCompleted) {
                badgeStyle = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40';
                dotBg = 'bg-emerald-400';
              } else if (isAbsent) {
                badgeStyle = 'bg-amber-950/60 text-amber-400 border-amber-800/40';
                dotBg = 'bg-amber-500';
              } else if (isHoliday) {
                badgeStyle = 'bg-sky-950/60 text-sky-400 border-sky-800/40';
                dotBg = 'bg-sky-400';
              }

              return (
                <div
                  key={idx}
                  className="bg-[#050505] border border-neutral-900 hover:border-neutral-800 rounded-2xl p-4 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isCompleted ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
                    ) : (
                      <span className={`w-3 h-3 rounded-full shrink-0 ${dotBg}`} />
                    )}
                    <div className="min-w-0">
                      <h4 className={`text-xs sm:text-sm font-bold text-white truncate ${isCompleted ? 'line-through text-neutral-400' : ''}`}>{evt.title}</h4>
                      <span className="text-[10px] text-neutral-500 block mt-0.5">
                        {isCompleted ? 'Completed' : evt.type || 'Scheduled Event'}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${badgeStyle}`}>
                    {isCompleted ? 'COMPLETED' : evt.type || 'TASK'}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-neutral-500 text-xs">
              No tasks or events recorded for this date.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-800/80 bg-[#050505] flex items-center justify-between">
          <button
            onClick={onOpenDayView}
            className="px-4 py-2.5 bg-[#be0919] hover:bg-[#990714] text-white font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center gap-2"
          >
            <span>View 24h Timeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
