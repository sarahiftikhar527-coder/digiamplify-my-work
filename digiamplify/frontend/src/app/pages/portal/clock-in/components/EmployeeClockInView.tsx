import React from 'react';
import { Calendar as CalendarIcon, Clock, Coffee, CheckCircle, Delete, FileText } from 'lucide-react';

interface EmployeeClockInViewProps {
  userProfile: any;
  attendance: any;
  stats: any;
  currentTime: string;
  currentDateStr: string;
  pin: string;
  onKeypadPress: (val: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onClockInAction: () => void;
  onBreakAction: (action: 'start' | 'end') => void;
  onForgotPinClick: () => void;
  isLoading: boolean;
  showDescriptionInput: boolean;
  todayDescription: string;
  setTodayDescription: (val: string) => void;
  formatTimeHM: (isoStr: string) => string;
  getStatusPill: () => React.ReactNode;
  getActionButtonText: () => string;
  isFormDisabled: boolean;
}

export default function EmployeeClockInView({
  userProfile,
  attendance,
  stats,
  currentTime,
  currentDateStr,
  pin,
  onKeypadPress,
  onBackspace,
  onClear,
  onClockInAction,
  onBreakAction,
  onForgotPinClick,
  isLoading,
  showDescriptionInput,
  todayDescription,
  setTodayDescription,
  formatTimeHM,
  getStatusPill,
  getActionButtonText,
  isFormDisabled
}: EmployeeClockInViewProps) {
  // Get current shift based on profile
  const isNightShift = userProfile?.shift?.toLowerCase() === 'night';
  const shiftTimeStr = isNightShift ? '06:00 PM - 12:00 AM' : '09:00 AM - 03:00 PM';
  const breakTimeStr = isNightShift ? '08:00 PM - 09:00 PM' : '12:00 PM - 01:00 PM';

  return (
    <div className="w-full flex flex-col justify-start">
      
      {/* Top Header Title with Medium Font & Spacing */}
      <div className="mb-12">
        <h1 className="text-3xl font-medium tracking-wide text-white">Clock In</h1>
        <p className="text-sm text-neutral-400 font-medium mt-3 leading-relaxed">
          Track your hours and manage your attendance.
        </p>
      </div>

      {/* Primary Page Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full animate-fadeIn">
        
        {/* Left Column: Welcome, Keypad, and Circular Clock (7 spans) */}
        <div className="lg:col-span-7 bg-black border border-neutral-900 rounded-xl p-6 lg:p-10 flex flex-col items-center shadow-lg relative">
          
          {/* Header Welcomer */}
          <div className="text-center mb-8">
            <h2 className="text-xl lg:text-2xl font-medium text-white tracking-wide">
              {attendance?.clockOut 
                ? `Good Bye ${userProfile?.fullName?.split(' ')[0] || 'Employee'}`
                : `Welcome ${userProfile?.fullName?.split(' ')[0] || 'Employee'}`
              }
            </h2>
            <p className="text-sm text-neutral-400 font-light mt-1.5">
              {attendance?.clockOut 
                ? 'Hope you had a productive day!'
                : 'Lets make today productive'
              }
            </p>
          </div>

          {/* Dynamic Date box */}
          <div className="flex items-center gap-2 border border-neutral-800 rounded-lg px-5 py-3 bg-[#0c0c0c] text-sm font-light text-neutral-300 mb-10 select-none">
            <CalendarIcon className="w-4.5 h-4.5 text-neutral-400" />
            <span>{currentDateStr || 'Loading Date...'}</span>
          </div>

          {/* Circular glowing clock (Scaled up) */}
          <div className="w-[260px] h-[260px] rounded-full bg-[#050505] border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] flex flex-col items-center justify-center p-6 mb-10 select-none">
            <span className="text-4xl font-bold text-white tracking-wide text-center uppercase block mb-1">
              {currentTime.split(' ')[0]}
            </span>
            <span className="text-sm text-neutral-400 font-bold tracking-widest block uppercase mb-1.5">
              {currentTime.split(' ')[1] || ''}
            </span>
            {getStatusPill()}
          </div>

          {/* Break actions bar (Shown when clocked in & not clocked out) */}
          {attendance && !attendance.clockOut && (
            <div className="flex gap-4 w-full max-w-[280px] mb-8 animate-fadeIn">
              {stats.status.toLowerCase() === 'on break' ? (
                <button
                  onClick={() => onBreakAction('end')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Coffee className="w-4 h-4" />
                  <span>End Break</span>
                </button>
              ) : (
                <button
                  onClick={() => onBreakAction('start')}
                  className="w-full py-3 bg-[#be0919] hover:bg-[#990714] text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Coffee className="w-4 h-4" />
                  <span>Take Break</span>
                </button>
              )}
            </div>
          )}

          {/* PIN keypad container */}
          <div className="w-full max-w-[340px] bg-black border border-white/20 rounded-xl p-6 flex flex-col items-center">
            
            <div className="w-full flex justify-between items-start mb-5 select-none">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Enter 4-Digit PIN</h3>
                <p className="text-xs text-neutral-400 font-light mt-1">Use your PIN to clock in</p>
              </div>
              <button 
                onClick={onForgotPinClick} 
                className="text-xs text-red-500 font-semibold hover:underline bg-transparent border-none cursor-pointer"
              >
                Forgot PIN?
              </button>
            </div>

            {/* Indicators */}
            <div className="flex gap-5 mb-6">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all bg-[#050505] ${
                    pin.length > idx 
                      ? 'border-red-500 text-white' 
                      : 'border-neutral-800 text-transparent'
                  }`}
                >
                  {pin.length > idx ? '●' : ''}
                </div>
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3 w-full mb-6 animate-fadeIn">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((val) => (
                <button
                  key={val}
                  disabled={!!isFormDisabled}
                  onClick={() => onKeypadPress(val)}
                  className="py-4 bg-[#0c0c0c] border border-white/10 hover:border-white/20 text-white rounded-lg font-medium text-base hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
                >
                  {val}
                </button>
              ))}
              
              {/* Backspace */}
              <button
                disabled={!!isFormDisabled}
                onClick={onBackspace}
                className="py-4 bg-[#0c0c0c] border border-white/10 hover:border-white/20 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
              >
                <Delete className="w-5 h-5" />
              </button>

              {/* 0 */}
              <button
                disabled={!!isFormDisabled}
                onClick={() => onKeypadPress('0')}
                className="py-4 bg-[#0c0c0c] border border-white/10 hover:border-white/20 text-white rounded-lg font-medium text-base hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
              >
                0
              </button>

              {/* Clear (#) */}
              <button
                disabled={!!isFormDisabled}
                onClick={onClear}
                className="py-4 bg-[#0c0c0c] border border-white/10 hover:border-white/20 text-white rounded-lg font-medium text-base hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
              >
                #
              </button>
            </div>

            {/* Main Submit Action */}
            <button
              disabled={!!isFormDisabled || isLoading}
              onClick={onClockInAction}
              className="w-full py-3.5 bg-[#be0919] hover:bg-[#990714] disabled:bg-neutral-900 disabled:text-neutral-500 disabled:border-neutral-800 disabled:cursor-not-allowed text-white font-bold rounded-lg text-sm tracking-wide shadow-md transition-all cursor-pointer"
            >
              {isLoading ? 'Verifying PIN...' : getActionButtonText()}
            </button>
          </div>

          {/* Description Box */}
          {showDescriptionInput && (
            <div className="w-full max-w-[340px] bg-black border border-white/20 rounded-xl p-6 mt-6 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4 select-none">
                <FileText className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold text-white tracking-wide">Description</h3>
              </div>
              <textarea
                disabled={!!attendance?.clockOut}
                value={todayDescription}
                onChange={(e) => setTodayDescription(e.target.value)}
                placeholder="Describe here what task you have completed today..."
                className="w-full min-h-[120px] bg-[#0c0c0c] border border-white/20 rounded-xl p-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50 resize-none font-medium leading-relaxed"
              />
            </div>
          )}

        </div>

        {/* Right Column: Shift Details & Logs Summary (5 spans) */}
        <div className="lg:col-span-5 flex flex-col gap-8 w-full">
          
          {/* Shift Panel */}
          <div className="bg-black border border-neutral-900 rounded-xl p-6 lg:p-8 shadow-md">
            <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-900 mb-6">
              <CalendarIcon className="w-5 h-5 text-white" />
              <h3 className="text-sm font-bold text-white tracking-wide">Assigned Shift</h3>
            </div>

            <div className="space-y-6 text-sm font-medium text-neutral-300">
              <div className="flex items-start gap-3.5">
                <Clock className="w-4.5 h-4.5 text-[#be0919] shrink-0 mt-0.5" />
                <div>
                  <span className="text-neutral-500 block mb-1 text-[11px] uppercase font-bold tracking-wider">Shift Time</span>
                  <span className="text-white text-sm font-semibold">{shiftTimeStr}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Coffee className="w-4.5 h-4.5 text-[#be0919] shrink-0 mt-0.5" />
                <div>
                  <span className="text-neutral-500 block mb-1 text-[11px] uppercase font-bold tracking-wider">Break Time</span>
                  <span className="text-white text-sm font-semibold">{breakTimeStr}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <CheckCircle className="w-4.5 h-4.5 text-[#be0919] shrink-0 mt-0.5" />
                <div>
                  <span className="text-neutral-500 block mb-1 text-[11px] uppercase font-bold tracking-wider">Total Working Hours</span>
                  <span className="text-white text-sm font-semibold">5h 0m (1h break)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Status logs */}
          <div className="bg-black border border-neutral-900 rounded-xl p-6 lg:p-8 shadow-md">
            <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-900 mb-6">
              <Clock className="w-5 h-5 text-[#be0919]" />
              <h3 className="text-sm font-bold text-white tracking-wide">Today's Status</h3>
            </div>

            <div className="divide-y divide-neutral-900 text-sm font-medium text-neutral-300">
              <div className="flex items-center justify-between py-4">
                <span className="text-neutral-500">Status</span>
                <span className={`px-3 py-1 rounded text-[11px] font-bold uppercase border ${
                  stats.status.toLowerCase() === 'on time'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : stats.status.toLowerCase() === 'absent' || stats.status.toLowerCase() === 'clocked out'
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    : stats.status.toLowerCase() === 'on break'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-red-500/10 text-[#ff4d5a] border-red-500/20'
                }`}>
                  {stats.status}
                </span>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-neutral-500">Clock In</span>
                <span className="text-emerald-400 font-semibold">
                  {attendance ? formatTimeHM(attendance.clockIn) : '--:--'}
                </span>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-neutral-500">Clock Out</span>
                <span className="text-emerald-400 font-semibold">
                  {attendance ? formatTimeHM(attendance.clockOut) : '--:--'}
                </span>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-neutral-500">Worked Hours</span>
                <span className="text-white font-semibold">{stats.workedHours}</span>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-neutral-500">Break Hours</span>
                <span className="text-white font-semibold">{stats.breakHours}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
