'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/layouts/Sidebar/Sidebar';
import {
  Calendar as CalendarIcon,
  Clock,
  Coffee,
  CheckCircle,
  AlertCircle,
  Delete,
  X,
  Lock,
  Key,
  FileText,
  Search,
  Filter,
  Users,
  Eye
} from 'lucide-react';

export default function ClockInPage() {
  const [userRole, setUserRole] = useState<string>('Employee');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    status: 'Absent',
    workedHours: '--h --m',
    breakHours: '--h --m'
  });
  const [pin, setPin] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot PIN modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetNewPin, setResetNewPin] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Description input states
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);
  const [todayDescription, setTodayDescription] = useState('');

  // Admin states
  const [adminRecords, setAdminRecords] = useState<any[]>([]);
  const [adminSummary, setAdminSummary] = useState<any>({
    totalCount: 0,
    clockedInCount: 0,
    onBreakCount: 0,
    clockedOutCount: 0,
    onTimeCount: 0,
    lateCount: 0
  });
  const [adminSearch, setAdminSearch] = useState('');
  const [adminFilterStatus, setAdminFilterStatus] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Get current shift based on profile
  const isNightShift = userProfile?.shift?.toLowerCase() === 'night';
  const shiftTimeStr = isNightShift ? '06:00 PM - 12:00 AM' : '09:00 AM - 03:00 PM';
  const breakTimeStr = isNightShift ? '08:00 PM - 09:00 PM' : '12:00 PM - 01:00 PM';

  useEffect(() => {
    // 1. Authenticate user
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // 2. Fetch today's clock in status & role
    fetchTodayStatus();

    // 3. Setup live clock
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );

      setCurrentDateStr(
        now.toLocaleDateString(undefined, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch admin logs if role is Admin
  useEffect(() => {
    if (userRole === 'Admin') {
      fetchAdminAttendanceLogs();
    }
  }, [userRole]);

  const fetchTodayStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/attendance/today', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setUserRole(data.role || 'Employee');
        setUserProfile(data.profile);
        setAttendance(data.attendance);
        setStats(data.stats);
        if (data.attendance?.description) {
          setTodayDescription(data.attendance.description);
          setShowDescriptionInput(true);
        } else {
          setTodayDescription('');
          setShowDescriptionInput(false);
        }
      }
    } catch (err: any) {
      console.error('Error fetching today status:', err);
    }
  };

  const fetchAdminAttendanceLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/attendance/admin/today', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setAdminRecords(data.records || []);
        setAdminSummary(data.summary || {
          totalCount: 0,
          clockedInCount: 0,
          onBreakCount: 0,
          clockedOutCount: 0,
          onTimeCount: 0,
          lateCount: 0
        });
      }
    } catch (err: any) {
      console.error('Error fetching admin attendance:', err);
    }
  };

  const handleKeypadPress = (val: string) => {
    setError('');
    if (pin.length < 4) {
      setPin((prev) => prev + val);
    }
  };

  const handleBackspace = () => {
    setError('');
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError('');
    setPin('');
  };

  const handleClockInAction = async () => {
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN code.');
      return;
    }

    setError('');
    setSuccess('');

    const isClockedIn = !!attendance?.clockIn;
    const isClockedOut = !!attendance?.clockOut;

    // Check if employee is clocking out and needs to provide description first
    if (isClockedIn && !isClockedOut) {
      if (!showDescriptionInput) {
        setShowDescriptionInput(true);
        setError('Please describe what tasks you completed today below.');
        return;
      }
      if (!todayDescription.trim()) {
        setError('Please write a brief summary of completed tasks before clocking out.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:5000/api/attendance/clock-in';
      let payload: any = { pin };

      if (isClockedIn && !isClockedOut) {
        url = 'http://localhost:5000/api/attendance/clock-out';
        payload.description = todayDescription;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setSuccess(isClockedIn ? 'Clocked out successfully!' : 'Clocked in successfully!');
      setPin('');
      fetchTodayStatus();
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBreakAction = async (action: 'start' | 'end') => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:5000/api/attendance/break/${action}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Break action failed');
      }

      setSuccess(action === 'start' ? 'Break started!' : 'Break ended, back to work!');
      fetchTodayStatus();
    } catch (err: any) {
      setError(err.message || 'Break action failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetPassword) {
      setResetError('Please enter your account password.');
      return;
    }
    if (resetNewPin.length !== 4 || !/^\d{4}$/.test(resetNewPin)) {
      setResetError('New PIN must be exactly 4 digits.');
      return;
    }

    setIsResetting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/attendance/reset-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: resetPassword, newPin: resetNewPin })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset PIN.');
      }

      setResetSuccess('PIN reset successfully! You can now clock in with your new PIN.');
      setResetPassword('');
      setResetNewPin('');
      setTimeout(() => {
        setShowResetModal(false);
        setResetSuccess('');
      }, 2500);
    } catch (err: any) {
      setResetError(err.message || 'Error occurred resetting PIN');
    } finally {
      setIsResetting(false);
    }
  };

  const formatTimeHM = (isoStr: string) => {
    if (!isoStr) return '--:--';
    return new Date(isoStr).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Determine visual style of status pill in clock circle
  const getStatusPill = () => {
    if (!attendance) {
      return (
        <span className="inline-flex items-center px-4.5 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm font-semibold rounded-full mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2 animate-pulse" />
          Not Clocked In
        </span>
      );
    }

    if (stats.status.toLowerCase() === 'clocked out') {
      return (
        <span className="inline-flex items-center px-4.5 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-400 text-sm font-semibold rounded-full mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 mr-2" />
          Clocked Out
        </span>
      );
    }

    if (stats.status.toLowerCase() === 'on break') {
      return (
        <span className="inline-flex items-center px-4.5 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-semibold rounded-full mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 animate-pulse" />
          On Break
        </span>
      );
    }

    if (attendance.status === 'LATE') {
      return (
        <span className="inline-flex items-center px-4.5 py-1.5 bg-[#be0919]/10 text-[#ff4d5a] border border-[#be0919]/20 text-sm font-semibold rounded-full mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#be0919] mr-2" />
          {attendance.lateDuration} Late
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-4.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-semibold rounded-full mt-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2" />
        On Time
      </span>
    );
  };

  const getActionButtonText = () => {
    if (!attendance) return 'Clock In';
    if (attendance.clockOut) return 'Already Clocked Out';
    if (showDescriptionInput) return 'Confirm Clock Out';
    return 'Clock Out';
  };

  const isFormDisabled = attendance?.clockOut;

  // Filter records for Admin Directory view
  const filteredRecords = adminRecords.filter((rec) => {
    const matchesSearch = rec.fullName.toLowerCase().includes(adminSearch.toLowerCase()) ||
                          rec.email.toLowerCase().includes(adminSearch.toLowerCase());
    
    if (adminFilterStatus === 'ALL') return matchesSearch;
    if (adminFilterStatus === 'ON_TIME') return matchesSearch && rec.status === 'On Time';
    if (adminFilterStatus === 'LATE') return matchesSearch && rec.status.includes('Late');
    if (adminFilterStatus === 'ON_BREAK') return matchesSearch && rec.status === 'On Break';
    if (adminFilterStatus === 'CLOCKED_OUT') return matchesSearch && rec.status === 'Clocked Out';
    if (adminFilterStatus === 'ABSENT') return matchesSearch && rec.status === 'Absent';
    return matchesSearch;
  });

  return (
    <div className="flex w-full min-h-screen bg-[#050505] text-white">
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 p-6 pt-24 sm:p-10 md:pt-10 flex flex-col justify-start overflow-y-auto max-h-screen">
        
        {/* Top Path bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-neutral-500 font-light text-sm flex items-center gap-1.5">
            <span className="text-red-500 font-medium">Clock In</span>
          </div>
        </div>

        {/* Global Alerts */}
        {error && (
          <div className="bg-[#be0919]/10 border border-[#be0919]/30 text-[#ff4d5a] text-xs py-3.5 px-4 rounded-[14px] mb-6 text-center font-light relative animate-fadeIn">
            {error}
            <button onClick={() => setError('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-3.5 px-4 rounded-[14px] mb-6 text-center font-light relative animate-fadeIn">
            {success}
            <button onClick={() => setSuccess('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* -------------------- ADMIN DASHBOARD VIEW -------------------- */}
        {userRole === 'Admin' ? (
          <div className="w-full flex flex-col justify-start">
            
            {/* Top Title */}
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-medium tracking-wide text-white">Attendance Dashboard</h1>
                <p className="text-sm text-neutral-400 font-medium mt-3 leading-relaxed">
                  Track employee shifts, worked hours, breaks, and daily summary notes for today.
                </p>
              </div>
              <button 
                onClick={fetchAdminAttendanceLogs}
                className="py-2.5 px-5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer self-start sm:self-auto"
              >
                Refresh Logs
              </button>
            </div>

            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
              
              <div className="bg-black border border-neutral-900 rounded-xl p-5 flex items-center gap-4 shadow-md select-none">
                <div className="p-3 bg-neutral-950 rounded-lg text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase font-bold tracking-wider mb-0.5">Total Staff</span>
                  <span className="text-xl font-bold text-white leading-none">{adminSummary.totalCount}</span>
                </div>
              </div>

              <div className="bg-black border border-neutral-900 rounded-xl p-5 flex items-center gap-4 shadow-md select-none">
                <div className="p-3 bg-emerald-950/20 rounded-lg text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase font-bold tracking-wider mb-0.5">Clocked In</span>
                  <span className="text-xl font-bold text-emerald-400 leading-none">
                    {adminSummary.clockedInCount} <span className="text-xs text-neutral-400 font-light font-sans ml-1">({adminSummary.onTimeCount} on time)</span>
                  </span>
                </div>
              </div>

              <div className="bg-black border border-neutral-900 rounded-xl p-5 flex items-center gap-4 shadow-md select-none">
                <div className="p-3 bg-blue-950/20 rounded-lg text-blue-400">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase font-bold tracking-wider mb-0.5">On Break</span>
                  <span className="text-xl font-bold text-blue-400 leading-none">{adminSummary.onBreakCount}</span>
                </div>
              </div>

              <div className="bg-black border border-neutral-900 rounded-xl p-5 flex items-center gap-4 shadow-md select-none">
                <div className="p-3 bg-red-950/20 rounded-lg text-[#ff4d5a]">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase font-bold tracking-wider mb-0.5">Late Logins</span>
                  <span className="text-xl font-bold text-[#ff4d5a] leading-none">{adminSummary.lateCount}</span>
                </div>
              </div>

            </div>

            {/* Filters Row */}
            <div className="bg-black border border-neutral-900 rounded-xl p-5 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between w-full shadow-md">
              <div className="relative w-full sm:w-[280px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search employee or email..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-white/20 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50 transition-all font-light"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 select-none">
                <Filter className="w-4 h-4 text-neutral-500" />
                <select
                  value={adminFilterStatus}
                  onChange={(e) => setAdminFilterStatus(e.target.value)}
                  className="w-full sm:w-[170px] bg-[#0c0c0c] border border-white/20 rounded-lg py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-red-500/50 cursor-pointer font-light"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ON_TIME">On Time</option>
                  <option value="LATE">Late Logins</option>
                  <option value="ON_BREAK">On Break</option>
                  <option value="CLOCKED_OUT">Clocked Out</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>
            </div>

            {/* Attendance logs Table card */}
            <div className="bg-black border border-neutral-900 rounded-xl overflow-hidden shadow-lg w-full">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-neutral-950 bg-[#050505] text-neutral-400 font-bold uppercase text-xs tracking-wider select-none">
                      <th className="py-4.5 px-6">Employee</th>
                      <th className="py-4.5 px-6">Shift</th>
                      <th className="py-4.5 px-6">Clock In</th>
                      <th className="py-4.5 px-6">Clock Out</th>
                      <th className="py-4.5 px-6 text-center">Status</th>
                      <th className="py-4.5 px-6">Active Worked</th>
                      <th className="py-4.5 px-6 text-right">Daily Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/50 font-medium text-neutral-300">
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((rec) => (
                        <tr key={rec.userId} className="hover:bg-neutral-950/30 transition-colors">
                          <td className="py-4.5 px-6">
                            <div className="flex flex-col">
                              <span className="text-base font-semibold text-white leading-tight">{rec.fullName}</span>
                              <span className="text-xs text-neutral-500 font-light mt-1 leading-none">{rec.email}</span>
                            </div>
                          </td>
                          <td className="py-4.5 px-6">
                            <span className="text-sm px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded font-semibold text-neutral-300 select-none">
                              {rec.shift.toLowerCase() === 'night' ? 'Night' : 'Day'}
                            </span>
                          </td>
                          <td className="py-4.5 px-6">
                            <span className={rec.clockIn !== '--:--' ? 'text-emerald-400 font-semibold text-sm whitespace-nowrap' : 'text-neutral-500 font-light text-sm whitespace-nowrap'}>
                              {rec.clockIn}
                            </span>
                          </td>
                          <td className="py-4.5 px-6">
                            <span className={rec.clockOut !== '--:--' ? 'text-emerald-400 font-semibold text-sm whitespace-nowrap' : 'text-neutral-500 font-light text-sm whitespace-nowrap'}>
                              {rec.clockOut}
                            </span>
                          </td>
                          <td className="py-4.5 px-6 text-center">
                            <span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase border select-none ${
                              rec.status.toLowerCase() === 'on time' || rec.status.toLowerCase().includes('late')
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : rec.status.toLowerCase() === 'clocked out'
                                ? 'bg-red-500/10 text-[#ff4d5a] border-red-500/20'
                                : rec.status.toLowerCase() === 'on break'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-4.5 px-6 text-sm text-white">
                            <div className="flex flex-col gap-1">
                              <span>W: <strong className="font-semibold text-neutral-300">{rec.workedHours}</strong></span>
                              <span className="text-xs text-neutral-500">B: <strong className="font-light">{rec.breakHours}</strong></span>
                            </div>
                          </td>
                          <td className="py-4.5 px-6 text-right">
                            {rec.description ? (
                              <button
                                onClick={() => {
                                  setSelectedRecord(rec);
                                  setShowNoteModal(true);
                                }}
                                className="inline-flex items-center gap-1 text-xs text-red-500 font-bold hover:underline bg-transparent border-none cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Note</span>
                              </button>
                            ) : (
                              <span className="text-xs text-neutral-600 font-light italic">No note submitted</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-neutral-500 font-light italic">
                          No matching employee attendance logs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          /* -------------------- EMPLOYEE KEYPAD VIEW -------------------- */
          <div className="w-full flex flex-col justify-start">
            
            {/* Top Header Title with Medium Font & Spacing */}
            <div className="mb-12">
              <h1 className="text-3xl font-medium tracking-wide text-white">Clock In</h1>
              <p className="text-sm text-neutral-400 font-medium mt-3 leading-relaxed">
                Track your hours and manage your attendance.
              </p>
            </div>

            {/* Primary Page Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
              
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
                  <div className="flex gap-4 w-full max-w-[280px] mb-8">
                    {stats.status.toLowerCase() === 'on break' ? (
                      <button
                        onClick={() => handleBreakAction('end')}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Coffee className="w-4 h-4" />
                        <span>End Break</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBreakAction('start')}
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
                      onClick={() => setShowResetModal(true)} 
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
                  <div className="grid grid-cols-3 gap-3 w-full mb-6">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((val) => (
                      <button
                        key={val}
                        disabled={!!isFormDisabled}
                        onClick={() => handleKeypadPress(val)}
                        className="py-4 bg-[#0c0c0c] border border-white/10 hover:border-white/20 text-white rounded-lg font-medium text-base hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {val}
                      </button>
                    ))}
                    
                    {/* Backspace */}
                    <button
                      disabled={!!isFormDisabled}
                      onClick={handleBackspace}
                      className="py-4 bg-[#0c0c0c] border border-white/10 hover:border-white/20 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Delete className="w-5 h-5" />
                    </button>

                    {/* 0 */}
                    <button
                      disabled={!!isFormDisabled}
                      onClick={() => handleKeypadPress('0')}
                      className="py-4 bg-[#0c0c0c] border border-white/10 hover:border-white/20 text-white rounded-lg font-medium text-base hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
                    >
                      0
                    </button>

                    {/* Clear (#) */}
                    <button
                      disabled={!!isFormDisabled}
                      onClick={handleClear}
                      className="py-4 bg-[#0c0c0c] border border-white/10 hover:border-white/20 text-white rounded-lg font-medium text-base hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
                    >
                      #
                    </button>
                  </div>

                  {/* Main Submit Action */}
                  <button
                    disabled={!!isFormDisabled || isLoading}
                    onClick={handleClockInAction}
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
        )}

      </div>

      {/* Forgot PIN Modal (Self-service Reset PIN) */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scaleIn">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-900 bg-[#050505]">
              <div className="flex items-center gap-2 select-none">
                <Key className="w-5 h-5 text-[#be0919]" />
                <h3 className="text-base font-bold text-white">Reset Keypad PIN</h3>
              </div>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetPassword('');
                  setResetNewPin('');
                  setResetError('');
                  setResetSuccess('');
                }}
                className="p-1 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleResetPin} className="p-6 space-y-5 text-sm">
              <p className="text-xs text-neutral-400 font-light mb-2 leading-relaxed">
                For security, verify your identity with your account login password to set a new 4-digit clock-in PIN.
              </p>

              {resetError && (
                <div className="bg-[#be0919]/10 border border-[#be0919]/30 text-[#ff4d5a] text-xs py-2 px-3 rounded-lg font-light text-center">
                  {resetError}
                </div>
              )}

              {resetSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-2 px-3 rounded-lg font-light text-center">
                  {resetSuccess}
                </div>
              )}

              {/* Password field */}
              <div className="flex flex-col">
                <label className="text-[12px] text-white/80 mb-2 font-normal poppins select-none">
                  Account Password <span className="text-[#be0919] font-bold">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter login password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-[12px] py-3 px-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50"
                  required
                />
              </div>

              {/* New PIN field */}
              <div className="flex flex-col">
                <label className="text-[12px] text-white/80 mb-2 font-normal poppins select-none">
                  New 4-Digit PIN <span className="text-[#be0919] font-bold">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter 4-digit number"
                  maxLength={4}
                  value={resetNewPin}
                  onChange={(e) => setResetNewPin(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-[12px] py-3 px-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50 tracking-[0.3em] font-bold text-center"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 border border-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-5 py-2 bg-[#be0919] hover:bg-[#990714] text-white rounded-lg text-xs font-bold transition-colors shadow-md cursor-pointer"
                >
                  {isResetting ? 'Saving PIN...' : 'Reset PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin View Task Note Modal */}
      {showNoteModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scaleIn">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-900 bg-[#050505]">
              <div className="flex items-center gap-2 select-none">
                <FileText className="w-5 h-5 text-white" />
                <h3 className="text-base font-bold text-white">Employee Task Summary</h3>
              </div>
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setSelectedRecord(null);
                }}
                className="p-1 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-neutral-950 text-xs font-light text-neutral-400 select-none">
                <div>
                  <span className="text-neutral-500 block uppercase font-bold text-[9px] mb-0.5">Submitted By</span>
                  <span className="text-white font-semibold text-sm">{selectedRecord.fullName}</span>
                  <span className="block text-[10px] mt-0.5">{selectedRecord.email}</span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500 block uppercase font-bold text-[9px] mb-0.5">Shift Type</span>
                  <span className="px-2 py-0.5 bg-neutral-900 rounded font-semibold text-neutral-300">{selectedRecord.shift}</span>
                </div>
              </div>

              <div>
                <span className="text-neutral-500 block uppercase font-bold text-[9px] mb-2 select-none">Daily Tasks Note</span>
                <div className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-xs text-neutral-200 leading-relaxed font-light whitespace-pre-wrap min-h-[140px] max-h-[220px] overflow-y-auto">
                  {selectedRecord.description}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-3 border-t border-neutral-950">
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setSelectedRecord(null);
                  }}
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  Close Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
