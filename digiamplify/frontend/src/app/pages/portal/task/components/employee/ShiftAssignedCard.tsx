'use client';

import React, { useEffect, useState } from 'react';
import { formatDateShort } from '@/utils/dateUtils';

interface ShiftRecord {
  id: string;
  dateStr: string;
  clockIn: string;
  clockOut: string;
  workHours: string;
  status: 'Done' | 'Left' | '-';
}

export default function ShiftAssignedCard() {
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShiftData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/attendance/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.logs && data.logs.length > 0) {
          const formatted = data.logs.slice(0, 5).map((log: any) => {
            const dateObj = new Date(log.clockInTime || log.date);
            const dateStr = formatDateShort(log.clockInTime || log.date);
            const clockIn = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            const clockOut = log.clockOutTime
              ? new Date(log.clockOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
              : '-';

            let workHours = '-';
            if (log.clockOutTime) {
              const diffMs = new Date(log.clockOutTime).getTime() - dateObj.getTime();
              const hours = Math.floor(diffMs / (1000 * 60 * 60));
              const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              workHours = `${hours}h ${mins}m`;
            }

            let status: 'Done' | 'Left' | '-' = log.clockOutTime ? 'Done' : 'Left';

            return {
              id: log.id,
              dateStr,
              clockIn,
              clockOut,
              workHours,
              status
            };
          });
          setShifts(formatted);
        } else {
          setShifts([]);
        }
      } else {
        setShifts([]);
      }
    } catch (e) {
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftData();
  }, []);


  return (
    <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 shadow-md flex flex-col justify-between select-none">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-normal text-white tracking-wide">Shift Assigned</h3>
      </div>

      <div className="overflow-x-auto custom-red-scrollbar-h">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-neutral-900 text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
              <th className="pb-3 px-2">Date</th>
              <th className="pb-3 px-2">Clock In</th>
              <th className="pb-3 px-2">Clock Out</th>
              <th className="pb-3 px-2">Work Hours</th>
              <th className="pb-3 px-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-950 font-normal">
            {shifts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-neutral-500 font-light">
                  No shift records logged yet.
                </td>
              </tr>
            ) : (
              shifts.map((row) => (
                <tr key={row.id} className="hover:bg-white/2 transition-colors">
                  <td className="py-3 px-2 text-neutral-300 whitespace-nowrap">{row.dateStr}</td>
                  <td className="py-3 px-2 text-neutral-400 font-mono whitespace-nowrap">{row.clockIn}</td>
                  <td className="py-3 px-2 text-neutral-400 font-mono whitespace-nowrap">{row.clockOut}</td>
                  <td className="py-3 px-2 text-neutral-300 font-medium whitespace-nowrap">{row.workHours}</td>
                  <td className="py-3 px-2 text-right font-semibold whitespace-nowrap">
                    {row.status === 'Done' ? (
                      <span className="text-emerald-400">Done</span>
                    ) : row.status === 'Left' ? (
                      <span className="text-[#ff4d5a]">Left</span>
                    ) : (
                      <span className="text-neutral-500">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}
