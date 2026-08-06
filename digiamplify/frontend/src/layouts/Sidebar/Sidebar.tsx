'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  User,
  Coins,
  Calendar,
  MessageSquare,
  Clock,
  HelpCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string; role: string; picture?: string; jobTitle?: string; fullName?: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);

  const loadUserData = () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const storedPicture = localStorage.getItem('profilePicture');
      const storedJobTitle = localStorage.getItem('jobTitle');
      const storedFullName = localStorage.getItem('fullName');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser({
            ...parsed,
            picture: storedPicture || parsed.picture || undefined,
            jobTitle: storedJobTitle || parsed.jobTitle || undefined,
            fullName: storedFullName || parsed.fullName || undefined,
          });
        } catch (e) {
          console.error('Failed to parse user details', e);
        }
      }
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data) {
          if (data.pictureUrl) localStorage.setItem('profilePicture', data.pictureUrl);
          if (data.jobTitle) localStorage.setItem('jobTitle', data.jobTitle);
          if (data.fullName) localStorage.setItem('fullName', data.fullName);
          setUser(prev => {
            if (!prev) return null;
            return {
              ...prev,
              picture: data.pictureUrl || undefined,
              jobTitle: data.jobTitle || undefined,
              fullName: data.fullName || undefined
            };
          });
        }
      }
    } catch (e) {
      console.error('Failed to fetch user profile in sidebar', e);
    }
  };

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    loadUserData();
    fetchProfile();

    const handleProfileUpdate = () => {
      loadUserData();
      fetchProfile();
    };

    window.addEventListener('profileUpdate', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    // Heartbeat logic
    const sendHeartbeat = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        await fetch('http://localhost:5000/api/auth/heartbeat', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (e) { }
    };

    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 30 * 1000);

    return () => {
      window.removeEventListener('profileUpdate', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
      clearInterval(heartbeatInterval);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handleSignout = async () => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }
      } catch (e) {
        console.error('Logout error:', e);
      }
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const isCustomAdmin = user?.role?.toLowerCase() === 'admin';
  const pathPrefix = isCustomAdmin ? '/admin' : '/portal';

  // Badges state
  const [badgeValues, setBadgeValues] = useState<{ [key: string]: number }>({});

  const checkUpdates = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) return;

    let parsedUser;
    try {
      parsedUser = JSON.parse(storedUser);
    } catch {
      return;
    }

    const isAdm = parsedUser.role?.toLowerCase() === 'admin';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const newValues: { [key: string]: number } = {};

    try {
      // 1. Chat Section unread count check
      const chatRes = await fetch('http://localhost:5000/api/chat/rooms', { headers });
      if (chatRes.ok) {
        const rooms = await chatRes.json();
        if (Array.isArray(rooms)) {
          const totalUnread = rooms.reduce((acc: number, r: any) => acc + (r.unreadCount || 0), 0);
          newValues['Chat'] = totalUnread;
        }
      }
    } catch (e) { }

    try {
      // 2. Tasks / Assign Tasks Section update check
      if (isAdm) {
        // Admin: check for pending task requests from employees
        const taskReqRes = await fetch('http://localhost:5000/api/tasks/requests', { headers });
        if (taskReqRes.ok) {
          const reqs = await taskReqRes.json();
          if (Array.isArray(reqs)) {
            const maxTime = reqs.reduce((max: number, r: any) => {
              const t = new Date(r.updatedAt || r.createdAt).getTime();
              return t > max ? t : max;
            }, 0);
            newValues['Assign Tasks'] = maxTime;
          }
        }
      } else {
        // Employee: check for assigned tasks updates
        const tasksRes = await fetch('http://localhost:5000/api/tasks', { headers });
        if (tasksRes.ok) {
          const tasks = await tasksRes.json();
          if (Array.isArray(tasks)) {
            const maxTime = tasks.reduce((max: number, t: any) => {
              const time = new Date(t.updatedAt || t.createdAt).getTime();
              return time > max ? time : max;
            }, 0);
            newValues['Tasks'] = maxTime;
          }
        }
      }
    } catch (e) { }

    try {
      // 3. Employees / Profile Section update check
      if (isAdm) {
        // Admin: check for pending employee registrations or profile edit requests
        const usersRes = await fetch('http://localhost:5000/api/profile/all', { headers });
        if (usersRes.ok) {
          const users = await usersRes.json();
          if (Array.isArray(users)) {
            const maxTime = users.reduce((max: number, u: any) => {
              const t1 = u.updatedAt ? new Date(u.updatedAt).getTime() : 0;
              const t2 = u.profile?.updatedAt ? new Date(u.profile.updatedAt).getTime() : 0;
              const t = Math.max(t1, t2);
              return t > max ? t : max;
            }, 0);
            newValues['Employees'] = maxTime;
          }
        }
      }
    } catch (e) { }

    try {
      // 4. Finance Section check
      if (isAdm) {
        // Admin: check if there are pending transaction requests
        const finRes = await fetch('http://localhost:5000/api/finance/admin/overview', { headers });
        if (finRes.ok) {
          const finData = await finRes.json();
          const transactions = finData?.transactions || [];
          if (Array.isArray(transactions)) {
            const maxTime = transactions.reduce((max: number, tx: any) => {
              const t = new Date(tx.updatedAt || tx.createdAt).getTime();
              return t > max ? t : max;
            }, 0);
            newValues['Finance'] = maxTime;
          }
        }
      } else {
        // Employee: check if any transaction/claim is pending
        const finRes = await fetch('http://localhost:5000/api/finance/employee', { headers });
        if (finRes.ok) {
          const finData = await finRes.json();
          const claims = finData?.claims || finData?.transactions || [];
          if (Array.isArray(claims)) {
            const maxTime = claims.reduce((max: number, tx: any) => {
              const t = new Date(tx.updatedAt || tx.createdAt).getTime();
              return t > max ? t : max;
            }, 0);
            newValues['Finance'] = maxTime;
          }
        }
      }
    } catch (e) { }

    try {
      // 5. Help & Support Section check
      const supportRes = await fetch('http://localhost:5000/api/support', { headers });
      if (supportRes.ok) {
        const tickets = await supportRes.json();
        if (Array.isArray(tickets)) {
          const maxTime = tickets.reduce((max: number, t: any) => {
            const time = new Date(t.updatedAt || t.createdAt).getTime();
            return time > max ? time : max;
          }, 0);
          newValues['Help & Support'] = maxTime;
        }
      }
    } catch (e) { }

    try {
      // 6. Clock In reminder for employees
      if (!isAdm) {
        const attRes = await fetch('http://localhost:5000/api/attendance/today', { headers });
        if (attRes.ok) {
          const att = await attRes.json();
          newValues['Clock In'] = (!att || !att.clockIn) ? 1 : 0;
        }
      }
    } catch (e) { }

    setBadgeValues(newValues);
  };

  useEffect(() => {
    checkUpdates();
    const interval = setInterval(checkUpdates, 5000); // Check every 5 seconds for fast updates!
    return () => clearInterval(interval);
  }, []);


  const getDisplayName = () => {
    if (isCustomAdmin) return 'Admin';
    if (user?.fullName && user.fullName.trim() !== '') return user.fullName;
    if (!user || !user.email) return 'Jhon Ken';
    const emailPrefix = user.email.split('@')[0];
    return emailPrefix
      .split('.')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };


  const getDisplayRole = () => {
    if (isCustomAdmin) return user?.jobTitle || 'System Administrator';
    if (user?.jobTitle) return user.jobTitle;
    if (user?.role) return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    return 'Employee';
  };

  const navItems = [
    { name: 'Dashboard', path: `${pathPrefix}/dashboard`, icon: LayoutDashboard },
    { name: isCustomAdmin ? 'Assign Tasks' : 'Tasks', path: `${pathPrefix}/task`, icon: ClipboardList },
    { name: isCustomAdmin ? 'Employees' : 'Profile', path: `${pathPrefix}/profile`, icon: User },
    { name: 'Finance', path: `${pathPrefix}/finance`, icon: Coins },
    { name: 'Calendar', path: '#', icon: Calendar },
    { name: 'Chat', path: `${pathPrefix}/chat`, icon: MessageSquare },
    { name: isCustomAdmin ? 'Clocked In Users' : 'Clock In', path: `${pathPrefix}/clock-in`, icon: Clock },
    { name: 'Help & Support', path: `${pathPrefix}/support`, icon: HelpCircle },
  ];

  return (
    <>
      { }
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 left-6 z-40 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:text-[#be0919] md:hidden cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.5)] transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      { }
      <div className={`fixed inset-y-0 left-0 w-[260px] h-screen bg-[#0a0a0a] border-r border-[#be0919]/25 flex flex-col justify-between py-8 px-6 z-50 shadow-[4px_0_24px_rgba(190,9,25,0.06)] shrink-0 transition-transform duration-300 md:static md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>


        <div className="absolute inset-y-0 right-0 w-[45px] bg-gradient-to-l from-[#be0919]/30 to-transparent pointer-events-none z-0" />

        { }
        <div className="flex flex-col flex-1 relative z-10 items-center">
          <Link href="/" className="mb-10 block transition-transform hover:scale-102">
            <Image
              src="/assets/logo.png"
              alt="DigiAmplify Logo"
              width={160}
              height={36}
              priority
            />
          </Link>

          { }
          <nav className="flex flex-col gap-2 w-full">
            {navItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== '#' && pathname?.startsWith(item.path));
              const Icon = item.icon;
              const currentValue = badgeValues[item.name] || 0;

              // Read seen value from localStorage
              let seenValue = 0;
              if (typeof window !== 'undefined') {
                const stored = localStorage.getItem(`badge_seen_${item.name}`);
                seenValue = stored ? parseInt(stored, 10) : 0;
              }

              // If seenValue is 0 (first load), initialize it to prevent historical alerts
              if (typeof window !== 'undefined' && !localStorage.getItem(`badge_seen_${item.name}`)) {
                const initVal = currentValue > 0 ? currentValue : Date.now();
                localStorage.setItem(`badge_seen_${item.name}`, initVal.toString());
                seenValue = initVal;
              }

              // If active, sync the seen value in localStorage to current
              if (isActive && currentValue !== seenValue) {
                if (typeof window !== 'undefined') {
                  const syncVal = currentValue > 0 ? currentValue : Date.now();
                  localStorage.setItem(`badge_seen_${item.name}`, syncVal.toString());
                }
              }

              const showBadge = !isActive && currentValue > seenValue;

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-4 py-3 px-4 rounded-[12px] transition-all duration-200 group text-sm font-medium ${isActive
                    ? 'bg-[#be0919] text-white shadow-[0_4px_15px_rgba(190,9,25,0.25)]'
                    : 'text-white hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className={`w-[18px] h-[18px] shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-white group-hover:text-white'
                    }`} />
                  <span>{item.name}</span>
                  {showBadge && (
                    <span className="w-3 h-3 rounded-full bg-[#7a0008] animate-pulse ml-auto shrink-0 border border-[#7a0008]/50 shadow-[0_0_8px_#7a0008]" />
                  )}
                </Link>
              );
            })}
          </nav>

          { }
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-4 py-3 px-4 rounded-[12px] text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-200 mt-8 mb-4 w-full text-left text-sm font-medium md:hidden cursor-pointer border-t border-neutral-900 pt-6"
          >
            <X className="w-[18px] h-[18px] shrink-0 text-neutral-400 hover:text-white" />
            <span className="text-white">Hide Menu</span>
          </button>
        </div>

        { }
        <div className="flex items-center justify-between border-t border-neutral-900 pt-6 mt-auto">
          <div className="flex items-center gap-3">
            { }
            <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.4)] overflow-hidden shrink-0">
              {user?.picture && !isCustomAdmin ? (
                <img
                  src={user.picture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-neutral-400" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-white text-[14px] font-semibold leading-tight truncate max-w-[120px]">
                {getDisplayName()}
              </span>
              <span className="text-neutral-500 text-[11px] font-light leading-none mt-1 truncate max-w-[120px]">
                {getDisplayRole()}
              </span>
            </div>
          </div>

          { }
          <button
            onClick={() => setShowSignoutConfirm(true)}
            title="Sign Out"
            className="p-2 rounded-lg text-neutral-500 hover:text-[#be0919] hover:bg-[#be0919]/5 transition-all duration-200 group cursor-pointer"
          >
            <LogOut className="w-[18px] h-[18px] transition-transform group-hover:-translate-x-0.5" />
          </button>
        </div>

      </div>

      {showSignoutConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">

            {/* Header */}
            <div className="p-6 border-b border-neutral-900 flex items-center justify-between">
              <span className="text-sm font-semibold text-white tracking-wide">Confirm Sign Out</span>
              <button
                onClick={() => setShowSignoutConfirm(false)}
                className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer border-none bg-transparent outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                Are you sure you want to sign out? You will need to enter your email and password to access your portal again.
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-neutral-900 flex justify-end gap-3 bg-[#050505]/20">
              <button
                onClick={() => setShowSignoutConfirm(false)}
                className="px-5 py-2.5 border border-neutral-900 hover:bg-neutral-900 text-neutral-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSignout}
                className="px-5 py-2.5 bg-[#be0919] hover:bg-[#990714] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-[0_2px_8px_rgba(190,9,25,0.2)] hover:shadow-[0_2px_12px_rgba(190,9,25,0.35)]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}