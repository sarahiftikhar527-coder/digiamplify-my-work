'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/layouts/Sidebar/Sidebar';
import {
  Bell,
  CheckSquare,
  Clock,
  AlertCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  MessageSquare,
  FileText,
  User,
  HelpCircle,
  Users,
  ArrowRight,
  X,
  CheckCircle2,
  Plus,
  Loader2,
  Target,
  Award,
  Star,
  Inbox,
} from 'lucide-react';
import SetAvailabilityModal from '../calendar/components/SetAvailabilityModal';
import EmployeePayslipModal from '../finance/components/EmployeePayslipModal';
import AdminDashboardView from './components/AdminDashboardView';
import { formatDateWithDay } from '@/utils/dateUtils';

interface TaskItem {
  id: number;
  title: string;
  time: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  category: 'Today' | 'Upcoming' | 'Completed';
}

interface Announcement {
  id: number;
  title: string;
  description: string;
  timeAgo: string;
}

interface LeaveRecord {
  id: number;
  type: string;
  dates: string;
  status: 'Approved' | 'Unapproved' | 'Pending';
}

interface Colleague {
  name: string;
  role: string;
  status: string;
}

const DEFAULT_TASKS: TaskItem[] = [
  { id: 1, title: 'Design the dashboard', time: '10:00 AM', priority: 'High', completed: false, category: 'Today' },
  { id: 2, title: 'Design the dashboard', time: '10:00 AM', priority: 'Medium', completed: false, category: 'Today' },
  { id: 3, title: 'Design the dashboard', time: '10:00 AM', priority: 'Low', completed: false, category: 'Today' },
  { id: 4, title: 'Design the dashboard', time: '10:00 AM', priority: 'Medium', completed: false, category: 'Today' },
  { id: 5, title: 'Review API documentation', time: '02:30 PM', priority: 'High', completed: false, category: 'Upcoming' },
  { id: 6, title: 'Team Sync Meeting', time: '04:00 PM', priority: 'Medium', completed: false, category: 'Upcoming' },
  { id: 7, title: 'Setup CI/CD pipeline', time: '09:00 AM', priority: 'Low', completed: true, category: 'Completed' },
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { id: 1, title: 'New HR policy update', description: 'Please review the updated HR policy regarding annual leaves and remote work guidelines.', timeAgo: '2h ago' },
  { id: 2, title: 'New HR policy update', description: 'Please review the updated HR policy regarding annual leaves and remote work guidelines.', timeAgo: '2h ago' },
  { id: 3, title: 'New HR policy update', description: 'Please review the updated HR policy regarding annual leaves and remote work guidelines.', timeAgo: '2h ago' },
  { id: 4, title: 'New HR policy update', description: 'Please review the updated HR policy regarding annual leaves and remote work guidelines.', timeAgo: '2h ago' },
];

export default function DashboardPage() {
  const router = useRouter();

  // Role & Tab state for Admin vs Employee dashboard
  const [role, setRole] = useState<string>('employee');
  const [dashboardTab, setDashboardTab] = useState<'admin' | 'personal'>('admin');

  // User details & Dynamic Greeting/Date
  const [userName, setUserName] = useState('User');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState('Good Morning');
  const [formattedDate, setFormattedDate] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  // Modals state
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Task category filter ('Today' | 'Upcoming' | 'Completed')
  const [taskCategory, setTaskCategory] = useState<'Today' | 'Upcoming' | 'Completed'>('Today');

  // Performance & Attendance period
  const [performancePeriod, setPerformancePeriod] = useState<'Today' | 'Month' | 'Week' | 'Year'>('Today');
  const [attendancePeriod, setAttendancePeriod] = useState<'Today' | 'Month' | 'Week' | 'Year'>('Today');

  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  // Metrics
  const [metrics, setMetrics] = useState({
    assigned: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
    todayProgress: 0,
  });

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS);

  // Leave balances
  const [leaveBalances, setLeaveBalances] = useState<LeaveRecord[]>([]);

  // Team
  const [teamMembers, setTeamMembers] = useState<Colleague[]>([]);

  // Dynamic Performance Overview calculation based on period dropdown
  const performanceRate = React.useMemo(() => {
    if (!tasks || tasks.length === 0) return 90;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const filtered = tasks.filter(t => {
      const d = (t as any).dueDate || (t as any).updatedAt || (t as any).createdAt;
      if (!d) return true;
      const taskDate = new Date(d);
      if (isNaN(taskDate.getTime())) return true;
      if (performancePeriod === 'Today') {
        return d.substring(0, 10) === todayStr;
      }
      const diffDays = Math.abs(now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24);
      if (performancePeriod === 'Week') return diffDays <= 7;
      if (performancePeriod === 'Month') return diffDays <= 30;
      return diffDays <= 365;
    });
    if (filtered.length === 0) return 100;
    const done = filtered.filter(t => t.completed || (t as any).status?.toUpperCase() === 'COMPLETED' || (t as any).status?.toUpperCase() === 'FINISHED').length;
    return Math.round((done / filtered.length) * 100);
  }, [tasks, performancePeriod]);

  // Leave Form
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [leaveStartDate, setLeaveStartDate] = useState('2026-08-15');
  const [leaveEndDate, setLeaveEndDate] = useState('2026-08-20');
  const [leaveReason, setLeaveReason] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Headers helper
  const getHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // Update dynamic greeting & date
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
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Initial user name and role from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          const name = u.fullName || u.name || u.email;
          if (name) {
            const first = name.split(' ')[0];
            setUserName(first);
          }
          const userRole = u.role?.toLowerCase() || 'employee';
          setRole(userRole);
          if (userRole === 'admin') {
            setDashboardTab('admin');
          }
        } catch (e) {}
      }
    }
  }, []);

  // Fetch Live API Data
  const fetchDashboardData = useCallback(async () => {
    setIsLoadingApi(true);
    try {
      const headers = getHeaders();

      // Profile
      try {
        const res = await fetch('/api/profile', { headers });
        if (res.ok) {
          const profile = await res.json();
          setUserProfile(profile);
          if (profile.fullName) {
            const first = profile.fullName.split(' ')[0];
            setUserName(first);
          }
          if (profile.role) {
            const userRole = profile.role.toLowerCase();
            setRole(userRole);
          }
        }
      } catch (e) {
        console.warn('Profile fetch warning:', e);
      }

      // Tasks
      try {
        const res = await fetch('/api/tasks', { headers });
        if (res.ok) {
          const fetched = await res.json();
          if (Array.isArray(fetched)) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const mapped: TaskItem[] = fetched.map((t: any, index: number) => {
              const statusUpper = (t.status || '').toUpperCase();
              const isDone = statusUpper === 'COMPLETED' || statusUpper === 'FINISHED';

              let category: 'Today' | 'Upcoming' | 'Completed' = 'Today';
              if (isDone) {
                category = 'Completed';
              } else if (t.dueDate) {
                const due = new Date(t.dueDate);
                due.setHours(0, 0, 0, 0);
                if (due > today) {
                  category = 'Upcoming';
                }
              }

              let priority: 'High' | 'Medium' | 'Low' = 'Medium';
              if (t.priority) {
                const pUpper = t.priority.toUpperCase();
                if (pUpper === 'HIGH') priority = 'High';
                else if (pUpper === 'LOW') priority = 'Low';
              }

              return {
                id: t.id || index + 1,
                title: t.subject || t.title || 'Task Item',
                time: t.dueTime || '10:00 AM',
                priority,
                completed: isDone,
                category,
              };
            });

            setTasks(mapped);

            const total = fetched.length;
            const completedCount = fetched.filter((t: any) => {
              const s = (t.status || '').toUpperCase();
              return s === 'COMPLETED' || s === 'FINISHED';
            }).length;

            const overdueCount = fetched.filter((t: any) => {
              const s = (t.status || '').toUpperCase();
              const isDone = s === 'COMPLETED' || s === 'FINISHED';
              return !isDone && t.dueDate && new Date(t.dueDate) < today;
            }).length;

            const inProgressCount = fetched.filter((t: any) => {
              const s = (t.status || '').toUpperCase();
              const isDone = s === 'COMPLETED' || s === 'FINISHED';
              const isOverdue = t.dueDate && new Date(t.dueDate) < today;
              return !isDone && !isOverdue;
            }).length;

            const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

            setMetrics({
              assigned: total,
              completed: completedCount,
              inProgress: inProgressCount,
              overdue: overdueCount,
              todayProgress: progress,
            });
          }
        }
      } catch (e) {
        console.warn('Tasks fetch warning:', e);
      }

      // Leave Requests
      try {
        const res = await fetch('/api/calendar/leave-request', { headers });
        if (res.ok) {
          const leaves = await res.json();
          if (Array.isArray(leaves) && leaves.length > 0) {
            const mappedLeaves: LeaveRecord[] = leaves.map((l: any, index: number) => ({
              id: l.id || index + 1,
              type: l.leaveType || 'Leave',
              dates: `${l.startDate} - ${l.endDate}`,
              status: l.status === 'APPROVED' ? 'Approved' : l.status === 'UNAPPROVED' ? 'Unapproved' : 'Pending',
            }));
            setLeaveBalances(mappedLeaves);
          }
        }
      } catch (e) {
        console.warn('Leave requests fetch warning:', e);
      }

      // Team
      try {
        const res = await fetch('/api/profile/all', { headers });
        if (res.ok) {
          const profiles = await res.json();
          if (Array.isArray(profiles) && profiles.length > 0) {
            const colleagues: Colleague[] = profiles.map((p: any) => ({
              name: p.fullName || p.email?.split('@')[0] || 'Team Member',
              role: p.jobTitle || p.role || 'Member',
              status: p.isClockedIn ? 'Online' : 'Offline',
            }));
            setTeamMembers(colleagues);
          }
        }
      } catch (e) {
        console.warn('Profiles fetch warning:', e);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoadingApi(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Toggle Task
  const toggleTask = async (id: number) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const newCompleted = !target.completed;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t))
    );

    try {
      const headers = getHeaders();
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newCompleted ? 'COMPLETED' : 'IN_PROGRESS' }),
      });
    } catch (e) {
      console.warn('Task patch warning:', e);
    }
  };

  // Leave Submit
  const handleRequestLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLeave(true);
    const dates = `${leaveStartDate} - ${leaveEndDate}`;
    const newRecord: LeaveRecord = {
      id: Date.now(),
      type: leaveType,
      dates,
      status: 'Pending',
    };

    try {
      const headers = getHeaders();
      await fetch('/api/calendar/leave-request', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          leaveType,
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          reason: leaveReason,
        }),
      });
    } catch (e) {
      console.warn('Leave request warning:', e);
    } finally {
      setLeaveBalances([newRecord, ...leaveBalances]);
      setIsLeaveModalOpen(false);
      setLeaveReason('');
      setSubmittingLeave(false);
    }
  };

  // Filter tasks based on category tab
  const activeCategoryTasks = tasks.filter((t) => {
    if (taskCategory === 'Completed') return t.completed || t.category === 'Completed';
    if (taskCategory === 'Upcoming') return t.category === 'Upcoming' && !t.completed;
    return (t.category === 'Today' || !t.category) && !t.completed;
  });

  // Guarantee at least sample tasks if filtered list is small
  const displayTasks = activeCategoryTasks.length > 0 ? activeCategoryTasks : DEFAULT_TASKS.filter((t) => t.category === taskCategory || (taskCategory === 'Today' && !t.completed));

  return (
    <div className="flex w-full min-h-screen bg-[#050505] text-white font-sans selection:bg-[#be0919]/30">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-8 md:pt-8 flex flex-col justify-start overflow-y-auto h-screen custom-scrollbar">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-neutral-400 font-medium">
            <span
              className="text-[#be0919] font-bold cursor-pointer hover:underline"
              onClick={() => router.push('/pages/portal/dashboard')}
            >
              Home
            </span>
            <span>/</span>
            <span className="text-neutral-200">Dashboard</span>
            {isLoadingApi && <Loader2 className="w-4 h-4 text-[#be0919] animate-spin ml-2" />}
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 transition-colors border border-neutral-800"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-neutral-300" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#be0919] animate-pulse" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-[#0d0d0d] border border-neutral-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Notifications</h4>
                    <span className="text-[10px] bg-[#be0919]/20 text-[#be0919] px-2 py-0.5 rounded-full font-semibold">
                      {announcements.length} New
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {announcements.slice(0, 4).map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          setSelectedAnnouncement(a);
                          setShowNotifications(false);
                        }}
                        className="p-2.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 transition-colors cursor-pointer border border-neutral-800/50"
                      >
                        <p className="font-semibold text-neutral-200">{a.title}</p>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">{a.description}</p>
                        <span className="text-[10px] text-neutral-500 mt-1 block">{a.timeAgo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-900 transition-colors border border-neutral-800"
              >
                <div className="w-8 h-8 rounded-full bg-[#1c1c1c] border border-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-200 overflow-hidden">
                  {userProfile?.picture ? (
                    <img src={userProfile.picture} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    userName.charAt(0).toUpperCase()
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-400 mr-1" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-[#0d0d0d] border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 text-xs text-neutral-300">
                  <button
                    onClick={() => router.push('/pages/portal/profile')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4 text-[#be0919]" />
                    Profile
                  </button>
                  <button
                    onClick={() => router.push('/pages/portal/support')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center gap-2 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-[#be0919]" />
                    Support
                  </button>
                  <div className="my-1 border-t border-neutral-800" />
                  <button
                    onClick={() => {
                      localStorage.clear();
                      router.push('/pages/login');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-900/30 text-red-400 flex items-center gap-2 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin / Personal View Toggle (for Admin Users) */}
        {role === 'admin' && (
          <div className="mb-6 flex items-center gap-3 bg-[#0c0c0c] border border-neutral-900 rounded-xl p-1.5 w-fit select-none">
            <button
              onClick={() => setDashboardTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                dashboardTab === 'admin'
                  ? 'bg-[#be0919] text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Admin Overview (Company Control)</span>
            </button>
            <button
              onClick={() => setDashboardTab('personal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                dashboardTab === 'personal'
                  ? 'bg-[#be0919] text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Personal Dashboard</span>
            </button>
          </div>
        )}

        {role === 'admin' && dashboardTab === 'admin' ? (
          <AdminDashboardView adminName={userName} />
        ) : (
          <div className="space-y-8">
            {/* Welcome Section & Top Gauges */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                  {greeting}, <span className="text-[#be0919]">{userName}</span>
                </h1>
                <p className="text-sm text-neutral-400 mt-1.5 font-normal">
                  {formattedDate ? `It's ${formattedDate}.` : ''}
                </p>
              </div>

              {/* 4 Stat Cards + Circular Progress Gauge */}
          <div className="flex flex-col xl:flex-row items-center gap-4">
            {/* 4 Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
              {/* Card 1 */}
              <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-2xl p-4 flex items-center gap-3.5 min-w-[135px] hover:border-neutral-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#be0919]/15 border border-[#be0919]/30 flex items-center justify-center shrink-0">
                  <CheckSquare className="w-5 h-5 text-[#be0919]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold leading-tight text-white">{metrics.assigned}</h3>
                  <p className="text-[11px] text-neutral-400 font-medium whitespace-nowrap">Task Assign</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-2xl p-4 flex items-center gap-3.5 min-w-[135px] hover:border-neutral-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#be0919]/15 border border-[#be0919]/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#be0919]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold leading-tight text-white">{metrics.completed}</h3>
                  <p className="text-[11px] text-neutral-400 font-medium whitespace-nowrap">Tasks Completed</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-2xl p-4 flex items-center gap-3.5 min-w-[135px] hover:border-neutral-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#be0919]/15 border border-[#be0919]/30 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-[#be0919]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold leading-tight text-white">{metrics.inProgress}</h3>
                  <p className="text-[11px] text-neutral-400 font-medium whitespace-nowrap">In Progress</p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-2xl p-4 flex items-center gap-3.5 min-w-[135px] hover:border-neutral-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#be0919]/15 border border-[#be0919]/30 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-[#be0919]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold leading-tight text-white">{metrics.overdue}</h3>
                  <p className="text-[11px] text-neutral-400 font-medium whitespace-nowrap">Overdue Tasks</p>
                </div>
              </div>
            </div>

            {/* Circular Gauge */}
            <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-2xl p-4 flex items-center justify-center w-full lg:w-[220px] shrink-0 relative overflow-hidden">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-neutral-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-[#be0919]"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * metrics.todayProgress) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="10"
                    r="4.5"
                    fill="#ffffff"
                    className="filter drop-shadow-[0_0_6px_#ffffff]"
                    transform="rotate(270 50 50)"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <span className="text-[10px] text-neutral-400 font-medium block leading-none">Today&apos;s Progress</span>
                  <span className="text-xl font-extrabold text-white my-0.5">{metrics.todayProgress}%</span>
                  <span className="text-[9px] text-neutral-400 font-normal leading-none">Task completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row (My Task, Performance Overview, Upcoming Tasks Calendar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1: My Task */}
          <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-3xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">My Task</h3>
                <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
                  {(['Today', 'Upcoming', 'Completed'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setTaskCategory(cat)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                        taskCategory === cat
                          ? 'bg-[#be0919] text-white shadow-md'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task list */}
              <div className="space-y-3">
                {displayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className="group flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800/60 hover:border-neutral-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          t.completed
                            ? 'bg-[#be0919] border-[#be0919] text-white'
                            : 'border-[#be0919] group-hover:bg-[#be0919]/20'
                        }`}
                      >
                        {t.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-bold transition-all ${
                            t.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                          }`}
                        >
                          {t.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              t.priority === 'High'
                                ? 'bg-[#be0919]'
                                : t.priority === 'Medium'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span className="text-[10px] text-neutral-400 font-medium">{t.priority} Priority</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] text-neutral-400 font-medium">{t.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Performance Overview */}
          <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-3xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white">Performance Overview</h3>
                <div className="relative">
                  <select
                    value={performancePeriod}
                    onChange={(e) => setPerformancePeriod(e.target.value as any)}
                    className="bg-neutral-900 text-xs font-semibold text-neutral-300 border border-neutral-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#be0919] cursor-pointer appearance-none pr-7"
                  >
                    <option value="Today">Today</option>
                    <option value="Week">Week</option>
                    <option value="Month">Month</option>
                    <option value="Year">Year</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-white">{performanceRate} %</h2>
                <p className="text-xs text-neutral-400 font-medium">Overall Performance ({performancePeriod})</p>
              </div>

              {/* Smooth Curved Line Graph SVG */}
              <div className="relative w-full h-36 mt-4 mb-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="performanceGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#be0919" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#be0919" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <line x1="0" y1="10" x2="300" y2="10" stroke="#1f1f1f" strokeDasharray="3 3" />
                  <line x1="0" y1="35" x2="300" y2="35" stroke="#1f1f1f" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="#1f1f1f" strokeDasharray="3 3" />
                  <line x1="0" y1="85" x2="300" y2="85" stroke="#1f1f1f" strokeDasharray="3 3" />

                  <path
                    d="M 0,95 C 40,80 60,60 90,65 C 120,70 140,40 170,40 C 200,40 220,60 250,20 C 270,10 285,15 300,10 L 300,100 L 0,100 Z"
                    fill="url(#performanceGlow)"
                  />

                  <path
                    d="M 0,95 C 40,80 60,60 90,65 C 120,70 140,40 170,40 C 200,40 220,60 250,20 C 270,10 285,15 300,10"
                    fill="none"
                    stroke="#be0919"
                    strokeWidth="3"
                  />

                  <line x1="275" y1="10" x2="275" y2="95" stroke="#be0919" strokeOpacity="0.5" strokeWidth="1.5" />
                  <circle cx="275" cy="15" r="4" fill="#ffffff" stroke="#be0919" strokeWidth="2" />
                </svg>

                <div className="absolute top-1 right-3 bg-[#be0919] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg">
                  90 %
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-neutral-400 font-medium px-1 mb-4">
                <span>5 Jul</span>
                <span>10 Jul</span>
                <span>15 Jul</span>
                <span>20 Jul</span>
                <span>25 Jul</span>
                <span>30 Jul</span>
              </div>
            </div>

            {/* Bottom KPI Highlights */}
            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-300">
              <div className="flex items-center gap-1.5">
                <Inbox className="w-3.5 h-3.5 text-[#be0919]" />
                <div>
                  <p className="text-[10px] text-neutral-400 font-medium">Goals Achieved</p>
                  <p className="font-extrabold text-white text-xs">7/10</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#be0919]" />
                <div>
                  <p className="text-[10px] text-neutral-400 font-medium">KPI Score</p>
                  <p className="font-extrabold text-white text-xs">95 %</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#be0919]" />
                <div>
                  <p className="text-[10px] text-neutral-400 font-medium">Feedback</p>
                  <p className="font-extrabold text-white text-xs">4.5/5</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Upcoming Tasks Calendar */}
          <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-3xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white">Upcoming Tasks Calendar</h3>
                <div className="flex items-center gap-1">
                  <button className="p-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-center text-xs font-semibold text-neutral-300 mb-3">
                July 2026
              </div>

              <div className="grid grid-cols-7 text-center text-[11px] text-neutral-400 font-semibold mb-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs text-neutral-300 font-medium mb-4">
                <span className="p-1.5 text-neutral-600">28</span>
                <span className="p-1.5 text-neutral-600">29</span>
                <span className="p-1.5 text-neutral-600">30</span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">1</span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">2</span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">3</span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">4</span>

                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">5</span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">6</span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">7</span>
                <span className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-bold relative">
                  8<span className="w-1 h-1 rounded-full bg-[#be0919] absolute bottom-1 left-1/2 -translate-x-1/2" />
                </span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">9</span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">10</span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">11</span>

                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">12</span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">13</span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">14</span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">15</span>
                <span className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-bold relative">
                  16<span className="w-1 h-1 rounded-full bg-[#be0919] absolute bottom-1 left-1/2 -translate-x-1/2" />
                </span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">17</span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">18</span>

                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">19</span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">20</span>
                <span className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-bold relative">
                  21<span className="w-1 h-1 rounded-full bg-[#be0919] absolute bottom-1 left-1/2 -translate-x-1/2" />
                </span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">22</span>
                <span className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-bold relative">
                  23<span className="w-1 h-1 rounded-full bg-[#be0919] absolute bottom-1 left-1/2 -translate-x-1/2" />
                </span>
                <span className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-bold relative">
                  24<span className="w-1 h-1 rounded-full bg-[#be0919] absolute bottom-1 left-1/2 -translate-x-1/2" />
                </span>
                <span className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-bold relative">
                  25<span className="w-1 h-1 rounded-full bg-[#be0919] absolute bottom-1 left-1/2 -translate-x-1/2" />
                </span>

                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">26</span>
                <span className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-bold relative">
                  27<span className="w-1 h-1 rounded-full bg-[#be0919] absolute bottom-1 left-1/2 -translate-x-1/2" />
                </span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">28</span>
                <span className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-bold relative">
                  29<span className="w-1 h-1 rounded-full bg-[#be0919] absolute bottom-1 left-1/2 -translate-x-1/2" />
                </span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">30</span>
                <span className="p-1.5 rounded-lg hover:bg-neutral-800 cursor-pointer">31</span>
                <span className="p-1.5 text-neutral-600">1</span>
              </div>
            </div>

            <button
              onClick={() => setIsAvailabilityOpen(true)}
              className="w-full py-2.5 rounded-xl bg-[#be0919] hover:bg-[#a50715] text-white text-xs font-bold tracking-wide transition-colors shadow-lg shadow-[#be0919]/20"
            >
              Set Availability
            </button>
          </div>
        </div>

        {/* Lower Row (Attendance Overview, New Announcement, Leave Balance) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Attendance Overview */}
          <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-3xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Attendance Overview</h3>
                <div className="relative">
                  <select
                    value={attendancePeriod}
                    onChange={(e) => setAttendancePeriod(e.target.value as any)}
                    className="bg-neutral-900 text-xs font-semibold text-neutral-300 border border-neutral-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#be0919] cursor-pointer appearance-none pr-7"
                  >
                    <option value="Today">Today</option>
                    <option value="Week">Week</option>
                    <option value="Month">Month</option>
                    <option value="Year">Year</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-7 text-center text-[11px] text-neutral-400 font-semibold mb-3">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-7 place-items-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#be0919]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#be0919]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#be0919]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#be0919]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#be0919]" />
                </div>
                <div className="grid grid-cols-7 place-items-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#be0919]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#be0919]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#be0919]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#be0919]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#be0919]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#be0919]/40" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#be0919]" />
                </div>
                <div className="grid grid-cols-7 place-items-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#be0919]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#be0919]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#be0919]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                  <span className="w-3.5 h-3.5 rounded-full bg-neutral-700" />
                  <span className="w-3.5 h-3.5 rounded-full bg-neutral-700" />
                  <span className="w-3.5 h-3.5 rounded-full bg-neutral-700" />
                </div>
                <div className="grid grid-cols-7 place-items-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-neutral-700" />
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                  <span className="w-3.5 h-3.5 rounded-full bg-neutral-700" />
                  <span className="w-3.5 h-3.5 rounded-full bg-neutral-700" />
                  <span className="w-3.5 h-3.5 rounded-full bg-neutral-700" />
                  <span className="w-3.5 h-3.5 rounded-full bg-neutral-700" />
                  <span className="w-3.5 h-3.5 rounded-full bg-neutral-700" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-3 border-t border-neutral-800/80">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#be0919]" />
                <span>Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#be0919]/40" />
                <span>Absent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Leave</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Card 2: New Announcement */}
          <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-3xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">New Announcement</h3>
                <span className="text-xs text-[#be0919] font-extrabold bg-[#be0919]/15 px-2.5 py-1 rounded-full border border-[#be0919]/30">
                  {announcements.length} New
                </span>
              </div>

              <div className="space-y-3">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAnnouncement(a)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800/60 hover:border-neutral-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#be0919]/15 border border-[#be0919]/30 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 text-[#be0919]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-200">{a.title}</p>
                        <p className="text-[11px] text-neutral-400 truncate max-w-[160px] sm:max-w-[200px]">
                          {a.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-neutral-400 font-medium shrink-0">{a.timeAgo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Leave Balance */}
          <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-3xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Leave Balance</h3>
                <button
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="text-xs font-bold text-[#be0919] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Apply
                </button>
              </div>

              <div className="space-y-3">
                {leaveBalances.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-200">{l.type}</p>
                        <p className="text-[11px] text-neutral-400 font-medium">{l.dates}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${
                        l.status === 'Approved'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                          : l.status === 'Unapproved'
                          ? 'bg-red-950/60 text-red-400 border-red-800/60'
                          : 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Quick Actions */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-white mb-4">Quick Actions</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Request Leave */}
            <div
              onClick={() => setIsLeaveModalOpen(true)}
              className="group bg-[#0d0d0d] border border-[#be0919]/30 hover:border-[#be0919] rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-[#be0919]/5 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#be0919]/15 border border-[#be0919]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5 text-[#be0919]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-200 group-hover:text-white">Request Leave</h4>
                  <p className="text-[11px] text-neutral-400">Apply for time off</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#be0919] group-hover:translate-x-1 transition-all" />
            </div>

            {/* Card 2: View Profile */}
            <div
              onClick={() => router.push('/pages/portal/profile')}
              className="group bg-[#0d0d0d] border border-[#be0919]/30 hover:border-[#be0919] rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-[#be0919]/5 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#be0919]/15 border border-[#be0919]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5 text-[#be0919]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-200 group-hover:text-white">View Profile</h4>
                  <p className="text-[11px] text-neutral-400">Access your files</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#be0919] group-hover:translate-x-1 transition-all" />
            </div>

            {/* Card 3: View Payslip */}
            <div
              onClick={() => setIsPayslipOpen(true)}
              className="group bg-[#0d0d0d] border border-[#be0919]/30 hover:border-[#be0919] rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-[#be0919]/5 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#be0919]/15 border border-[#be0919]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5 text-[#be0919]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-200 group-hover:text-white">View Payslip</h4>
                  <p className="text-[11px] text-neutral-400">Check your salary</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#be0919] group-hover:translate-x-1 transition-all" />
            </div>

            {/* Card 4: Help Center */}
            <div
              onClick={() => router.push('/pages/portal/support')}
              className="group bg-[#0d0d0d] border border-[#be0919]/30 hover:border-[#be0919] rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-[#be0919]/5 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#be0919]/15 border border-[#be0919]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-5 h-5 text-[#be0919]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-200 group-hover:text-white">Help Center</h4>
                  <p className="text-[11px] text-neutral-400">Get support</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#be0919] group-hover:translate-x-1 transition-all" />
            </div>

            {/* Card 5: Team */}
            <div
              onClick={() => setIsTeamModalOpen(true)}
              className="group bg-[#0d0d0d] border border-[#be0919]/30 hover:border-[#be0919] rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-[#be0919]/5 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#be0919]/15 border border-[#be0919]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5 text-[#be0919]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-200 group-hover:text-white">Team</h4>
                  <p className="text-[11px] text-neutral-400">Find Colleagues</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#be0919] group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
        </div>
        )}

        {/* --- Interactive Modals --- */}

        {/* Set Availability Modal */}
        {isAvailabilityOpen && (
          <SetAvailabilityModal
            onClose={() => setIsAvailabilityOpen(false)}
            onSuccess={() => setIsAvailabilityOpen(false)}
          />
        )}

        {/* Employee Payslip Modal */}
        {isPayslipOpen && (
          <EmployeePayslipModal
            transaction={{
              id: 'PAY-2026-07',
              title: 'Monthly Salary - July 2026',
              reference: 'REF-8839201',
              amount: '$4,500.00',
              amountRaw: 4500,
              type: 'Salary Deposit',
              date: '09 July 2026',
              status: 'SUCCESSFUL',
            }}
            onClose={() => setIsPayslipOpen(false)}
          />
        )}

        {/* Request Leave Modal */}
        {isLeaveModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#0d0d0d] border border-neutral-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-white mb-4">Request Leave</h3>

              <form onSubmit={handleRequestLeaveSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#be0919]"
                  >
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      value={leaveStartDate}
                      onChange={(e) => setLeaveStartDate(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#be0919]"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      value={leaveEndDate}
                      onChange={(e) => setLeaveEndDate(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#be0919]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Reason (Optional)</label>
                  <textarea
                    rows={3}
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Provide details for your leave request..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#be0919]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsLeaveModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-neutral-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingLeave}
                    className="flex-1 py-2.5 rounded-xl bg-[#be0919] hover:bg-[#a50715] text-white font-bold flex items-center justify-center gap-2"
                  >
                    {submittingLeave ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Announcement Detail Modal */}
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#0d0d0d] border border-neutral-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#be0919]/15 border border-[#be0919]/30 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[#be0919]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedAnnouncement.title}</h3>
                  <span className="text-[10px] text-neutral-500">{selectedAnnouncement.timeAgo}</span>
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed mb-6 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800/60">
                {selectedAnnouncement.description}
              </p>

              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="w-full py-2.5 rounded-xl bg-[#be0919] hover:bg-[#a50715] text-white text-xs font-bold"
              >
                Close Announcement
              </button>
            </div>
          </div>
        )}

        {/* Team Modal */}
        {isTeamModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#0d0d0d] border border-neutral-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
              <button
                onClick={() => setIsTeamModalOpen(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-white mb-4">Team Directory</h3>

              <div className="space-y-3 text-xs max-h-72 overflow-y-auto pr-1">
                {teamMembers.map((colleague, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#be0919]/20 text-[#be0919] font-bold flex items-center justify-center border border-[#be0919]/30">
                        {colleague.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-neutral-200">{colleague.name}</p>
                        <p className="text-[10px] text-neutral-400">{colleague.role}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        colleague.status === 'Online'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {colleague.status}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsTeamModalOpen(false)}
                className="w-full mt-4 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
