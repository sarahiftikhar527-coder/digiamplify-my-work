'use client';

import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Sun, Moon, Check, CheckCircle2 } from 'lucide-react';

interface SetAvailabilityModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function SetAvailabilityModal({ onClose, onSuccess }: SetAvailabilityModalProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Thu', 'Sat']);
  const [fromDate, setFromDate] = useState('2026-07-12');
  const [toDate, setToDate] = useState('2026-07-14');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('02:00 PM');
  const [selectedShift, setSelectedShift] = useState<'morning' | 'afternoon' | 'night'>('morning');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('Availability saved successfully!');
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-[#080808] border border-neutral-900 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-red-500/10 rounded-2xl text-[#be0919] border border-red-500/20">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-wide">Set Availability</h2>
            <p className="text-xs text-neutral-400 mt-1 font-light">
              Select the days, date range, time and shift for your availability.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-5 py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Select Days */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Select Days <span className="text-[#be0919]">*</span>
            </label>
            <div className="grid grid-cols-7 gap-2">
              {daysList.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`py-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#3b090f] border-[#be0919] text-white shadow-md'
                        : 'bg-[#040404] border-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-800'
                    }`}
                  >
                    <span>{day}</span>
                    <Check className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-neutral-600'}`} />
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-neutral-500 font-light mt-2 block">You can select multiple days</span>
          </div>

          {/* Select Date Range */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Select Date <span className="text-[#be0919]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1.5">From</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full bg-[#040404] border border-neutral-900 rounded-2xl py-3 px-4 text-xs text-white focus:outline-none focus:border-red-500/60 font-light cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1.5">To</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full bg-[#040404] border border-neutral-900 rounded-2xl py-3 px-4 text-xs text-white focus:outline-none focus:border-red-500/60 font-light cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Select Time */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Select Time <span className="text-[#be0919]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1.5">Start Time</span>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-[#040404] border border-neutral-900 rounded-2xl py-3 px-4 text-xs text-white focus:outline-none focus:border-red-500/60 font-light"
                />
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1.5">End Time</span>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-[#040404] border border-neutral-900 rounded-2xl py-3 px-4 text-xs text-white focus:outline-none focus:border-red-500/60 font-light"
                />
              </div>
            </div>
          </div>

          {/* Select Shift Cards */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Select Shift <span className="text-[#be0919]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Morning Shift */}
              <div
                onClick={() => setSelectedShift('morning')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all relative ${
                  selectedShift === 'morning'
                    ? 'bg-[#150608] border-[#be0919] text-white shadow-lg'
                    : 'bg-[#040404] border-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                {selectedShift === 'morning' && (
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#be0919] flex items-center justify-center text-white text-[10px]">
                    ✓
                  </span>
                )}
                <Sun className={`w-5 h-5 mb-2 ${selectedShift === 'morning' ? 'text-red-500' : 'text-neutral-400'}`} />
                <span className="text-xs font-bold text-white block">Morning Shift</span>
                <span className="text-[10px] text-neutral-400 mt-1 font-mono block">09:00 AM - 02:00 PM</span>
              </div>

              {/* Afternoon Shift */}
              <div
                onClick={() => setSelectedShift('afternoon')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all relative ${
                  selectedShift === 'afternoon'
                    ? 'bg-[#150608] border-[#be0919] text-white shadow-lg'
                    : 'bg-[#040404] border-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                {selectedShift === 'afternoon' && (
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#be0919] flex items-center justify-center text-white text-[10px]">
                    ✓
                  </span>
                )}
                <Sun className={`w-5 h-5 mb-2 ${selectedShift === 'afternoon' ? 'text-red-500' : 'text-neutral-400'}`} />
                <span className="text-xs font-bold text-white block">Afternoon Shift</span>
                <span className="text-[10px] text-neutral-400 mt-1 font-mono block">02:00 PM - 07:00 PM</span>
              </div>

              {/* Night Shift */}
              <div
                onClick={() => setSelectedShift('night')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all relative ${
                  selectedShift === 'night'
                    ? 'bg-[#150608] border-[#be0919] text-white shadow-lg'
                    : 'bg-[#040404] border-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                {selectedShift === 'night' && (
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#be0919] flex items-center justify-center text-white text-[10px]">
                    ✓
                  </span>
                )}
                <Moon className={`w-5 h-5 mb-2 ${selectedShift === 'night' ? 'text-red-500' : 'text-neutral-400'}`} />
                <span className="text-xs font-bold text-white block">Night Shift</span>
                <span className="text-[10px] text-neutral-400 mt-1 font-mono block">07:00 PM - 12:00 AM</span>
              </div>

            </div>
          </div>

          {/* Save Action Button */}
          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold transition-all cursor-pointer shadow-[0_2px_12px_rgba(190,9,25,0.3)] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Availability'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
