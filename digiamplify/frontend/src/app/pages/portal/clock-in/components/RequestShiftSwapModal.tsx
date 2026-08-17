'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface RequestShiftSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmitted: () => void;
}

export default function RequestShiftSwapModal({
  isOpen,
  onClose,
  onRequestSubmitted
}: RequestShiftSwapModalProps) {
  const [requestType, setRequestType] = useState<'TIMING_CHANGE' | 'WEEKDAY_OFF_SUNDAY_WORK'>('TIMING_CHANGE');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().slice(0, 10));
  const [requestedShift, setRequestedShift] = useState('09:00 AM - 05:00 PM');
  const [reason, setReason] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate || !requestedShift || !reason) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/attendance/shift-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetDate,
          requestType,
          requestedShift,
          reason
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'Shift adjustment request submitted!');
        setTimeout(() => {
          onRequestSubmitted();
          onClose();
        }, 1400);
      } else {
        setErrorMsg(data.error || 'Failed to submit shift request.');
      }
    } catch (err) {
      console.error('Error submitting shift request:', err);
      setErrorMsg('Error connecting to backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-neutral-900 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#be0919]/10 border border-[#be0919]/30 flex items-center justify-center text-[#be0919]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Request Shift Adjustment</h2>
              <p className="text-xs text-neutral-400">Request custom shift timing or weekday-off / Sunday swap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer border border-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce" />
            <h3 className="text-base font-bold text-white">{successMsg}</h3>
            <p className="text-xs text-neutral-400">Your request has been forwarded to Admin for approval.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-semibold">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-neutral-400 font-bold mb-1.5 uppercase tracking-wider">Adjustment Type</label>
              <select
                value={requestType}
                onChange={(e: any) => {
                  const val = e.target.value;
                  setRequestType(val);
                  if (val === 'WEEKDAY_OFF_SUNDAY_WORK') {
                    setRequestedShift('Swap Weekday Off in exchange for Sunday Work');
                  } else {
                    setRequestedShift('09:00 AM - 05:00 PM');
                  }
                }}
                className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#be0919]"
              >
                <option value="TIMING_CHANGE">Temporary Shift Timing Change</option>
                <option value="WEEKDAY_OFF_SUNDAY_WORK">Weekday Off / Sunday Work Swap</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 font-bold mb-1.5 uppercase tracking-wider">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be0919]"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1.5 uppercase tracking-wider">Requested Shift / Swap</label>
                <input
                  type="text"
                  placeholder={requestType === 'TIMING_CHANGE' ? 'e.g. 09:00 AM - 05:00 PM' : 'e.g. Off on Tuesday, Work on Sunday'}
                  value={requestedShift}
                  onChange={(e) => setRequestedShift(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-[#be0919]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 font-bold mb-1.5 uppercase tracking-wider">Reason / Justification</label>
              <textarea
                rows={3}
                placeholder="Explain the reason for requesting this shift timing change..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-[#be0919]"
                required
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-900">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold transition-all cursor-pointer border border-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{isLoading ? 'Submitting...' : 'Submit Request for Approval'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
