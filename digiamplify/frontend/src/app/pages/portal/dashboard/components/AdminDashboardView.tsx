'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { downloadCSV } from '@/utils/csvHelper';
import { formatDateWithDay, formatDateStandard } from '@/utils/dateUtils';
import {
  Users,
  CheckSquare,
  Clock,
  HelpCircle,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Plus,
  Loader2,
  FileText,
  MessageSquare,
  UserPlus,
  Coins,
  Calendar,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface AdminDashboardViewProps {
  adminName: string;
}

export default function AdminDashboardView({ adminName }: AdminDashboardViewProps) {
  const router = useRouter();

  // Dynamic Greeting & Date
  const [greeting, setGreeting] = useState('Good Morning');
  const [formattedDate, setFormattedDate] = useState('');

  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Metrics Data
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const [teamProfiles, setTeamProfiles] = useState<any[]>([]);
  const [taskMetrics, setTaskMetrics] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
    completionRate: 0,
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [attendanceOverview, setAttendanceOverview] = useState<{
    total: number;
    clockedIn: number;
    records: any[];
  }>({ total: 0, clockedIn: 0, records: [] });
  const [pendingSupport, setPendingSupport] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);

  // Calculate dynamic time and date
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours();
      let g = 'Good Morning';
      if (h >= 12 && h < 17) {
        g = 'Good Afternoon';
      } else if (h >= 17) {
        g = 'Good Evening';
      }
      setGreeting(g);

      setFormattedDate(formatDateWithDay(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const getHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // Fetch all Admin Data
  const fetchAdminDashboardData = useCallback(async () => {
    setLoading(true);
    const headers = getHeaders();

    try {
      // 1. Employees / Team Profiles
      try {
        const res = await fetch('/api/profile/all', { headers });
        if (res.ok) {
          const profiles = await res.json();
          if (Array.isArray(profiles)) {
            const emps = profiles.filter((p: any) => p.role?.toLowerCase() !== 'admin');
            setEmployeeCount(emps.length || profiles.length);
            setTeamProfiles(profiles);
          }
        }
      } catch (e) {
        console.warn('Error fetching profiles:', e);
      }

      // 2. All Tasks (Company-wide)
      try {
        const res = await fetch('/api/tasks', { headers });
        if (res.ok) {
          const tasks = await res.json();
          if (Array.isArray(tasks)) {
            const total = tasks.length;
            const completed = tasks.filter((t: any) => {
              const s = (t.status || '').toUpperCase();
              return s === 'COMPLETED' || s === 'FINISHED';
            }).length;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const overdue = tasks.filter((t: any) => {
              const s = (t.status || '').toUpperCase();
              const isDone = s === 'COMPLETED' || s === 'FINISHED';
              return !isDone && t.dueDate && new Date(t.dueDate) < today;
            }).length;

            const inProgress = tasks.filter((t: any) => {
              const s = (t.status || '').toUpperCase();
              const isDone = s === 'COMPLETED' || s === 'FINISHED';
              const isOverdue = t.dueDate && new Date(t.dueDate) < today;
              return !isDone && !isOverdue;
            }).length;

            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

            setTaskMetrics({
              total,
              completed,
              inProgress,
              overdue,
              completionRate: rate,
            });
          }
        }
      } catch (e) {
        console.warn('Error fetching tasks:', e);
      }

      // 3. Task Creation Requests (Pending Approval)
      try {
        const res = await fetch('/api/tasks/requests', { headers });
        if (res.ok) {
          const reqs = await res.json();
          if (Array.isArray(reqs)) {
            const pending = reqs.filter((r: any) => r.status?.toUpperCase() === 'PENDING');
            setPendingRequests(pending);
          }
        }
      } catch (e) {
        console.warn('Error fetching task requests:', e);
      }

      // 4. Admin Attendance Today
      try {
        const res = await fetch('/api/attendance/admin/today', { headers });
        if (res.ok) {
          const att = await res.json();
          setAttendanceOverview({
            total: att.totalCount || 0,
            clockedIn: att.clockedInCount || 0,
            records: att.attendanceRecords || [],
          });
        }
      } catch (e) {
        console.warn('Error fetching attendance overview:', e);
      }

      // 5. Support Tickets
      try {
        const res = await fetch('/api/support', { headers });
        if (res.ok) {
          const tickets = await res.json();
          if (Array.isArray(tickets)) {
            const pending = tickets.filter((t: any) => t.status?.toUpperCase() === 'PENDING');
            setPendingSupport(pending);
          }
        }
      } catch (e) {
        console.warn('Error fetching support tickets:', e);
      }

      // 6. Leave Requests
      try {
        const res = await fetch('/api/calendar/leave-request', { headers });
        if (res.ok) {
          const leaves = await res.json();
          if (Array.isArray(leaves)) {
            const pending = leaves.filter((l: any) => l.status?.toUpperCase() === 'PENDING');
            setPendingLeaves(pending);
          }
        }
      } catch (e) {
        console.warn('Error fetching leave requests:', e);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchAdminDashboardData();
  }, [fetchAdminDashboardData]);

  // Handle Approve Task Request
  const handleApproveRequest = async (requestId: string) => {
    setActionLoadingId(requestId);
    try {
      const headers = getHeaders();
      const res = await fetch(`/api/tasks/requests/${requestId}/approve`, {
        method: 'POST',
        headers,
      });

      if (res.ok) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
        fetchAdminDashboardData();
      }
    } catch (e) {
      console.error('Approve error:', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Reject Task Request
  const handleRejectRequest = async (requestId: string) => {
    setActionLoadingId(requestId);
    try {
      const headers = getHeaders();
      const res = await fetch(`/api/tasks/requests/${requestId}/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rejectionReason: 'Request rejected by Admin' }),
      });

      if (res.ok) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
        fetchAdminDashboardData();
      }
    } catch (e) {
      console.error('Reject error:', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 selection:bg-[#be0919]/30">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0d0d0d] border border-neutral-800/80 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 bg-[#be0919]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#be0919]/20 border border-[#be0919]/40 text-[#be0919] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Administrator Control Center
            </span>
            {loading && <Loader2 className="w-4 h-4 text-[#be0919] animate-spin" />}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            {greeting}, <span className="text-[#be0919]">{adminName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-medium">
            {formattedDate ? `It's ${formattedDate}.` : ''} Real-time operational overview across all departments.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 z-10">
          <button
            onClick={() => router.push('/admin/task')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#be0919] hover:bg-[#a50715] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg shadow-[#be0919]/20"
          >
            <Plus className="w-4 h-4" />
            Assign Task
          </button>
          <button
            onClick={() => router.push('/admin/profile')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 text-xs font-bold transition-all"
          >
            <UserPlus className="w-4 h-4 text-[#be0919]" />
            Manage Staff
          </button>
          <button
            onClick={() => router.push('/admin/finance')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 text-xs font-bold transition-all"
          >
            <Coins className="w-4 h-4 text-emerald-400" />
            Payroll Overview
          </button>
        </div>
      </div>

      {/* Top Executive KPI Stat Cards (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Employees */}
        <div
          onClick={() => router.push('/admin/profile')}
          className="bg-[#0d0d0d] border border-neutral-800/80 hover:border-neutral-700 rounded-2xl p-4 flex items-center gap-3.5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="w-11 h-11 rounded-xl bg-[#be0919]/15 border border-[#be0919]/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5 text-[#be0919]" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-none">{employeeCount}</h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-1">Total Employees</p>
          </div>
        </div>

        {/* Card 2: Company Tasks */}
        <div
          onClick={() => router.push('/admin/task')}
          className="bg-[#0d0d0d] border border-neutral-800/80 hover:border-neutral-700 rounded-2xl p-4 flex items-center gap-3.5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CheckSquare className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-none">{taskMetrics.total}</h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-1">Company Tasks</p>
          </div>
        </div>

        {/* Card 3: Today's Attendance */}
        <div
          onClick={() => router.push('/admin/clock-in')}
          className="bg-[#0d0d0d] border border-neutral-800/80 hover:border-neutral-700 rounded-2xl p-4 flex items-center gap-3.5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-none">
              {attendanceOverview.clockedIn} / {employeeCount || attendanceOverview.total || 5}
            </h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-1">Clocked In Today</p>
          </div>
        </div>

        {/* Card 4: Pending Task Requests */}
        <div
          onClick={() => router.push('/admin/task')}
          className="bg-[#0d0d0d] border border-neutral-800/80 hover:border-neutral-700 rounded-2xl p-4 flex items-center gap-3.5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <AlertCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-none">{pendingRequests.length}</h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-1">Pending Requests</p>
          </div>
        </div>

        {/* Card 5: Pending Support */}
        <div
          onClick={() => router.push('/admin/support')}
          className="bg-[#0d0d0d] border border-neutral-800/80 hover:border-neutral-700 rounded-2xl p-4 flex items-center gap-3.5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <HelpCircle className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-none">{pendingSupport.length}</h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-1">Support Tickets</p>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Task Approval Queue & Staff Attendance Monitor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Pending Task Creation Requests Approval Queue */}
          <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#be0919]/15 border border-[#be0919]/30 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 text-[#be0919]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Pending Task Creation Requests</h3>
                  <p className="text-[11px] text-neutral-400">Task requests submitted by employees requiring your approval</p>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-[#be0919]/15 border border-[#be0919]/30 text-[#be0919] px-3 py-1 rounded-full">
                {pendingRequests.length} Pending
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
                <p>No pending task requests requiring approval.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => {
                  const requesterName =
                    req.assignedBy?.profile?.fullName || req.assignedBy?.email || 'Employee';
                  const assigneeName =
                    req.assignedTo?.profile?.fullName || req.assignedTo?.email || 'Assignee';

                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-lg">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              req.priority?.toUpperCase() === 'HIGH'
                                ? 'bg-red-950/60 text-red-400 border-red-800/60'
                                : req.priority?.toUpperCase() === 'MEDIUM'
                                ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                                : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                            }`}
                          >
                            {req.priority} Priority
                          </span>
                          <span className="text-xs font-bold text-neutral-200">{req.subject}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 line-clamp-2">{req.description}</p>
                        <div className="flex items-center gap-4 text-[10px] text-neutral-500 pt-1">
                          <span>Requested by: <strong className="text-neutral-300">{requesterName}</strong></span>
                          <span>Assignee: <strong className="text-neutral-300">{assigneeName}</strong></span>
                          <span>Due: <strong className="text-neutral-300">{formatDateStandard(req.dueDate)}</strong></span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          disabled={actionLoadingId === req.id}
                          onClick={() => handleApproveRequest(req.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                        >
                          {actionLoadingId === req.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          Approve
                        </button>
                        <button
                          disabled={actionLoadingId === req.id}
                          onClick={() => handleRejectRequest(req.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-red-900/40 text-neutral-300 hover:text-red-300 text-xs font-bold transition-all border border-neutral-700"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 2: Staff Attendance & Status Monitor */}
          <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Live Staff Attendance Monitor</h3>
                  <p className="text-[11px] text-neutral-400">Real-time shift clock-in status for active employees</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/admin/clock-in')}
                className="text-xs text-[#be0919] font-bold hover:underline flex items-center gap-1"
              >
                View Full Logs <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamProfiles
                .filter((p) => p.role?.toLowerCase() !== 'admin')
                .slice(0, 6)
                .map((emp) => {
                  const empName = emp.fullName || emp.email?.split('@')[0] || 'Employee';
                  const jobTitle = emp.jobTitle || 'Team Member';
                  const department = emp.department || 'General';

                  // Check attendance record
                  const record = attendanceOverview.records.find(
                    (r: any) => r.userId === emp.userId || r.id === emp.userId || r.name === empName
                  );
                  const isClockedIn = record ? record.status !== 'Absent' : emp.isClockedIn;
                  const statusText = record ? record.status : isClockedIn ? 'Clocked In' : 'Clocked Out';

                  return (
                    <div
                      key={emp.id || emp.userId}
                      className="p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs text-white uppercase">
                          {empName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{empName}</p>
                          <p className="text-[10px] text-neutral-400">
                            {jobTitle} • {department}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          isClockedIn
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                            : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                        }`}
                      >
                        {statusText}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Support Desk & Quick Leave Approvals */}
        <div className="space-y-6">
          {/* Card 1: Company Task Completion Metric */}
          <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-extrabold text-white">Company Task Execution</h3>
                <TrendingUp className="w-4 h-4 text-[#be0919]" />
              </div>

              <div className="my-3 text-center">
                <span className="text-4xl font-black text-white">{taskMetrics.completionRate}%</span>
                <p className="text-xs text-neutral-400 mt-1 font-medium">Overall Company Completion Rate</p>
              </div>

              <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden my-3">
                <div
                  className="bg-[#be0919] h-full rounded-full transition-all duration-500"
                  style={{ width: `${taskMetrics.completionRate}%` }}
                />
              </div>

              <div className="grid grid-cols-3 text-center text-xs pt-2 border-t border-neutral-800/80">
                <div>
                  <p className="text-[10px] text-neutral-400">Completed</p>
                  <p className="font-bold text-white">{taskMetrics.completed}</p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400">In Progress</p>
                  <p className="font-bold text-amber-400">{taskMetrics.inProgress}</p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400">Overdue</p>
                  <p className="font-bold text-red-400">{taskMetrics.overdue}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Pending Support Tickets */}
          <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-800/80">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-extrabold text-white">Open Support Tickets</h3>
              </div>
              <span className="text-[10px] font-bold bg-purple-950/60 text-purple-400 border border-purple-800/60 px-2 py-0.5 rounded-full">
                {pendingSupport.length} Pending
              </span>
            </div>

            {pendingSupport.length === 0 ? (
              <div className="text-center py-6 text-neutral-500 text-xs">
                No unresolved support tickets.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingSupport.slice(0, 4).map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => router.push('/admin/support')}
                    className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/60 hover:border-neutral-700 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                        {ticket.issueType}
                      </span>
                      <span className="text-[10px] text-neutral-500">{ticket.priority}</span>
                    </div>
                    <p className="text-xs font-bold text-neutral-200 truncate">{ticket.subject}</p>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">{ticket.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Pending Leave Applications */}
          <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-800/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white">Leave Applications</h3>
              </div>
              <span className="text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded-full">
                {pendingLeaves.length} Pending
              </span>
            </div>

            {pendingLeaves.length === 0 ? (
              <div className="text-center py-6 text-neutral-500 text-xs">
                No pending employee leave applications.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLeaves.slice(0, 3).map((leave) => (
                  <div
                    key={leave.id}
                    className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/60 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{leave.leaveType}</p>
                      <p className="text-[10px] text-neutral-400">
                        {leave.startDate} to {leave.endDate}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60 px-2 py-1 rounded-xl">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
