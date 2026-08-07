'use client';

import React, { useState } from 'react';
import { X, Edit3, Calendar as CalendarIcon, Flag, UploadCloud, CheckCircle2 } from 'lucide-react';

interface RequestLeaveModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function RequestLeaveModal({ onClose, onSuccess }: RequestLeaveModalProps) {
  const [approver, setApprover] = useState('James Jhon');
  const [startDate, setStartDate] = useState('2026-07-15');
  const [endDate, setEndDate] = useState('2026-07-20');
  const [subject, setSubject] = useState('');
  const [leaveType, setLeaveType] = useState('Sick');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/calendar/leave-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          leaveType,
          startDate,
          endDate,
          reason: description || subject
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit leave request');
      }

      setSuccessMsg('Leave request submitted successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'An error occurred submitting request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#080808] border border-neutral-900 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto select-none">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-red-500/10 rounded-2xl text-[#be0919] border border-red-500/20">
            <Edit3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-wide">Request Leave</h2>
            <p className="text-xs text-neutral-400 mt-1 font-light">Fill the details below to request a leave</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 py-3 px-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-5 py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Assign To (Approver) */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Assign To (Approver) <span className="text-[#be0919]">*</span>
            </label>
            <div className="bg-[#040404] border border-neutral-900 rounded-2xl p-2.5 flex flex-col gap-2">
              {approver ? (
                <div className="flex items-center justify-between bg-[#121212] border border-neutral-800 rounded-xl p-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-300 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white block">James Jhon</span>
                      <span className="text-[10px] text-neutral-400 block">HR Manager</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setApprover('')}
                    className="text-neutral-500 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <select
                  onChange={(e) => setApprover(e.target.value)}
                  className="w-full bg-transparent text-xs text-neutral-300 focus:outline-none cursor-pointer py-1"
                >
                  <option value="">Search and select approver</option>
                  <option value="James Jhon">James Jhon (HR Manager)</option>
                  <option value="Sarah Smith">Sarah Smith (Engineering Lead)</option>
                </select>
              )}
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Start Date <span className="text-[#be0919]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#040404] border border-neutral-900 rounded-2xl py-3 px-4 text-xs text-white focus:outline-none focus:border-red-500/60 font-light cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                End Date <span className="text-[#be0919]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#040404] border border-neutral-900 rounded-2xl py-3 px-4 text-xs text-white focus:outline-none focus:border-red-500/60 font-light cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Subject & Leave Type Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Subject <span className="text-[#be0919]">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter leave subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#040404] border border-neutral-900 rounded-2xl py-3 px-4 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/60 font-light"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Leave Type <span className="text-[#be0919]">*</span>
              </label>
              <div className="relative">
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-[#040404] border border-neutral-900 rounded-2xl py-3 px-4 pl-10 text-xs text-white focus:outline-none focus:border-red-500/60 font-light cursor-pointer appearance-none"
                >
                  <option value="Sick">Sick</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                </select>
                <Flag className="w-4 h-4 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Description <span className="text-[#be0919]">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Enter description for leave..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#040404] border border-neutral-900 rounded-2xl p-4 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/60 font-light resize-none"
            />
          </div>

          {/* Attachment Zone */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Attachment
            </label>
            <div className="border border-dashed border-neutral-800 rounded-2xl p-6 bg-[#040404] flex flex-col items-center justify-center text-center">
              <div className="p-3 rounded-full bg-neutral-900 text-neutral-400 mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white block">Drag & Drop files here</span>
              <span className="text-[11px] text-neutral-500 font-light mt-1 block">
                or <button type="button" className="text-red-500 font-semibold hover:underline cursor-pointer">browse files</button> from computer
              </span>
              <div className="flex items-center gap-2 mt-4">
                <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-[10px] font-bold text-neutral-400 rounded-lg">.PDF</span>
                <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-[10px] font-bold text-neutral-400 rounded-lg">.DOC</span>
                <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-[10px] font-bold text-neutral-400 rounded-lg">.PNG</span>
                <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-[10px] font-bold text-neutral-400 rounded-lg">.JPG</span>
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold transition-all cursor-pointer shadow-[0_2px_12px_rgba(190,9,25,0.3)] disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
