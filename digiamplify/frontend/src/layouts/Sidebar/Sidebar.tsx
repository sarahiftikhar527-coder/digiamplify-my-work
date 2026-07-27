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
  const [user, setUser] = useState<{ email: string; role: string; picture?: string; jobTitle?: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const loadUserData = () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const storedPicture = localStorage.getItem('profilePicture');
      const storedJobTitle = localStorage.getItem('jobTitle');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser({
            ...parsed,
            picture: storedPicture || parsed.picture || undefined,
            jobTitle: storedJobTitle || parsed.jobTitle || undefined,
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
          setUser(prev => {
            if (!prev) return null;
            return {
              ...prev,
              picture: data.pictureUrl || undefined,
              jobTitle: data.jobTitle || undefined
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

    return () => {
      window.removeEventListener('profileUpdate', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
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

  // Helper to derive capitalised name from email
  const getDisplayName = () => {
    if (isCustomAdmin) return 'Admin';
    if (!user || !user.email) return 'Jhon Ken';
    const emailPrefix = user.email.split('@')[0];
    return emailPrefix
      .split('.')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper to retrieve role name
  const getDisplayRole = () => {
    if (isCustomAdmin) return 'Admin';
    if (user?.jobTitle) return user.jobTitle;
    if (user?.role) return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    return 'Employee';
  };

  const navItems = [
    { name: 'Dashboard', path: `${pathPrefix}/dashboard`, icon: LayoutDashboard },
    { name: 'Task', path: '#', icon: ClipboardList },
    { name: 'Profile', path: `${pathPrefix}/profile`, icon: User },
    { name: 'Finance', path: '#', icon: Coins },
    { name: 'Calendar', path: '#', icon: Calendar },
    { name: 'Chat', path: '#', icon: MessageSquare },
    { name: 'Clock In', path: '#', icon: Clock },
    { name: 'Help & Support', path: '#', icon: HelpCircle },
  ];

  return (
    <>
      {/* Floating Hamburger button for mobile */}
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

      {/* Sidebar Drawer */}
      <div className={`fixed inset-y-0 left-0 w-[260px] h-screen bg-[#0a0a0a] border-r border-[#be0919]/25 flex flex-col justify-between py-8 px-6 z-50 shadow-[4px_0_24px_rgba(190,9,25,0.06)] shrink-0 transition-transform duration-300 md:static md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>


        <div className="absolute inset-y-0 right-0 w-[45px] bg-gradient-to-l from-[#be0919]/30 to-transparent pointer-events-none z-0" />

        {/* Top Section: Logo */}
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

          {/* Sidebar Navigation */}
          <nav className="flex flex-col gap-2 w-full">
            {navItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== '#' && pathname?.startsWith(item.path));
              const Icon = item.icon;

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
                </Link>
              );
            })}
          </nav>

          {/* Hide Menu option for mobile ONLY */}
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-4 py-3 px-4 rounded-[12px] text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-200 mt-8 mb-4 w-full text-left text-sm font-medium md:hidden cursor-pointer border-t border-neutral-900 pt-6"
          >
            <X className="w-[18px] h-[18px] shrink-0 text-neutral-400 hover:text-white" />
            <span className="text-white">Hide Menu</span>
          </button>
        </div>

        {/* Bottom Section: Profile Panel */}
        <div className="flex items-center justify-between border-t border-neutral-900 pt-6 mt-auto">
          <div className="flex items-center gap-3">
            {/* Simple User Logo or Uploaded Profile Image */}
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

          {/* Signout Button */}
          <button
            onClick={handleSignout}
            title="Sign Out"
            className="p-2 rounded-lg text-neutral-500 hover:text-[#be0919] hover:bg-[#be0919]/5 transition-all duration-200 group cursor-pointer"
          >
            <LogOut className="w-[18px] h-[18px] transition-transform group-hover:-translate-x-0.5" />
          </button>
        </div>

      </div>
    </>
  );
}