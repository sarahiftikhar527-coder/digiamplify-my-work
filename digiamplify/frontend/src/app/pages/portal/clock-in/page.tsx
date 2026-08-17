'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/layouts/Sidebar/Sidebar';
import { X } from 'lucide-react';

import EmployeeClockInView from './components/EmployeeClockInView';
import AdminClockInView from './components/AdminClockInView';
import ResetPinModal from './components/ResetPinModal';
import TaskNoteModal from './components/TaskNoteModal';
import RequestShiftSwapModal from './components/RequestShiftSwapModal';

export default function ClockInPage() {
  const [userRole, setUserRole] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          return JSON.parse(stored)?.role || 'Employee';
        } catch (e) {}
      }
    }
    return 'Employee';
  });
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

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetNewPin, setResetNewPin] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const [showDescriptionInput, setShowDescriptionInput] = useState(false);
  const [todayDescription, setTodayDescription] = useState('');

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
  const [adminFilterStatus, setAdminFilterStatus] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const [showShiftSwapModal, setShowShiftSwapModal] = useState(false);
  const [shiftRequests, setShiftRequests] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const storedUserStr = localStorage.getItem('user');
    if (storedUserStr) {
      try {
        const u = JSON.parse(storedUserStr);
        if (u?.role) {
          setUserRole(u.role);
        }
      } catch (e) {}
    }

    fetchTodayStatus();
    fetchShiftRequests();

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

  useEffect(() => {
    if (userRole === 'Admin') {
      fetchAdminAttendanceLogs();
      fetchShiftRequests();
    }
  }, [userRole]);

  const fetchShiftRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/attendance/shift-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setShiftRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching shift requests:', err);
    }
  };

  const handleUpdateShiftRequestStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/attendance/shift-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setSuccess(`Shift adjustment request ${status.toLowerCase()} successfully.`);
        fetchShiftRequests();
      }
    } catch (err) {
      console.error('Error updating shift request status:', err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTodayStatus();
      if (userRole === 'Admin') {
        fetchAdminAttendanceLogs();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [userRole]);

  const fetchTodayStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/attendance/today', {
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
        }
        if (data.attendance?.clockIn && !data.attendance?.clockOut) {
          setShowDescriptionInput(true);
        }
      }
    } catch (err: any) {
      console.error('Error fetching today status:', err);
    }
  };


  const fetchAdminAttendanceLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/attendance/admin/today', {
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

    if (isClockedIn && !isClockedOut) {
      if (!todayDescription.trim()) {
        setError('Please write a brief summary of completed tasks before clocking out.');
        return;
      }
    }


    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      let url = '/api/attendance/clock-in';
      let payload: any = { pin };

      if (isClockedIn && !isClockedOut) {
        url = '/api/attendance/clock-out';
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
      const url = `/api/attendance/break/${action}`;

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
      const response = await fetch('/api/attendance/reset-pin', {
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

  const filteredRecords = adminRecords.filter((rec) => {
    const matchesSearch = rec.fullName.toLowerCase().includes(adminSearch.toLowerCase()) ||
                          rec.email.toLowerCase().includes(adminSearch.toLowerCase());

    if (!matchesSearch) return false;

    const status = adminFilterStatus.toLowerCase();
    if (status === 'all') return true;
    if (status === 'clocked in') {
      return rec.status !== 'Absent' && rec.status !== 'Clocked Out';
    }
    if (status === 'clocked out') {
      return rec.status === 'Clocked Out';
    }
    if (status === 'late') {
      return rec.isLate;
    }
    if (status === 'on break') {
      return rec.status === 'On Break';
    }
    if (status === 'absent') {
      return rec.status === 'Absent';
    }
    return true;
  });

  return (
    <div className="flex w-full min-h-screen bg-[#050505] text-white">
      <Sidebar />

      <div className="flex-1 p-6 pt-24 sm:p-10 md:pt-10 flex flex-col justify-start overflow-y-auto max-h-screen">



        {error && (
          <div className="bg-[#be0919]/10 border border-[#be0919]/30 text-[#ff4d5a] text-xs py-3.5 px-4 rounded-[14px] mb-6 text-center font-light relative animate-fadeIn">
            {error}
            <button onClick={() => setError('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-3.5 px-4 rounded-[14px] mb-6 text-center font-light relative animate-fadeIn">
            {success}
            <button onClick={() => setSuccess('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {userRole === 'Admin' ? (
          <AdminClockInView
            searchQuery={adminSearch}
            setSearchQuery={setAdminSearch}
            statusFilter={adminFilterStatus}
            setStatusFilter={setAdminFilterStatus}
            totalEmployeesCount={adminSummary.totalCount}
            presentEmployeesCount={adminSummary.clockedInCount}
            absentEmployeesCount={adminSummary.totalCount - adminSummary.clockedInCount}
            lateEmployeesCount={adminSummary.lateCount}
            onBreakEmployeesCount={adminSummary.onBreakCount}
            filteredRecords={filteredRecords}
            onViewNoteClick={(rec) => {
              setSelectedRecord(rec);
              setShowNoteModal(true);
            }}
            shiftRequests={shiftRequests}
            onApproveShiftRequest={(id) => handleUpdateShiftRequestStatus(id, 'APPROVED')}
            onRejectShiftRequest={(id) => handleUpdateShiftRequestStatus(id, 'REJECTED')}
          />
        ) : (
          <EmployeeClockInView
            userProfile={userProfile}
            attendance={attendance}
            stats={stats}
            currentTime={currentTime}
            currentDateStr={currentDateStr}
            pin={pin}
            onKeypadPress={handleKeypadPress}
            onBackspace={handleBackspace}
            onClear={handleClear}
            onClockInAction={handleClockInAction}
            onBreakAction={handleBreakAction}
            onForgotPinClick={() => setShowResetModal(true)}
            isLoading={isLoading}
            showDescriptionInput={showDescriptionInput}
            todayDescription={todayDescription}
            setTodayDescription={setTodayDescription}
            formatTimeHM={formatTimeHM}
            getStatusPill={getStatusPill}
            getActionButtonText={getActionButtonText}
            isFormDisabled={isFormDisabled}
            onRequestShiftSwapClick={() => setShowShiftSwapModal(true)}
          />
        )}

      </div>

      <ResetPinModal
        isOpen={showResetModal}
        onClose={() => {
          setShowResetModal(false);
          setResetPassword('');
          setResetNewPin('');
          setResetError('');
          setResetSuccess('');
        }}
        password={resetPassword}
        setPassword={setResetPassword}
        newPin={resetNewPin}
        setNewPin={setResetNewPin}
        onSubmit={handleResetPin}
        error={resetError}
        success={resetSuccess}
        isLoading={isResetting}
      />

      <TaskNoteModal
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          setSelectedRecord(null);
        }}
        selectedRecord={selectedRecord}
      />

      <RequestShiftSwapModal
        isOpen={showShiftSwapModal}
        onClose={() => setShowShiftSwapModal(false)}
        onRequestSubmitted={() => {
          fetchShiftRequests();
          setSuccess('Shift adjustment request submitted successfully.');
        }}
      />

    </div>
  );
}
