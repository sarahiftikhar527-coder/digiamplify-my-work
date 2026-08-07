'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/layouts/Sidebar/Sidebar';
import AdminFinanceView from './components/AdminFinanceView';
import EmployeeFinanceView from './components/EmployeeFinanceView';
import { User, Users } from 'lucide-react';

export default function FinancePage() {
  const [role, setRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'admin'>('personal');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setRole(parsed.role?.toLowerCase() || 'employee');
      } catch (e) {
        console.error('Failed to parse user role', e);
        setRole('employee');
      }
    } else {
      setRole('employee');
    }
  }, []);

  if (role === null) {
    return (
      <div className="flex h-screen bg-[#050505]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#be0919]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-6 pt-24 sm:p-10 md:pt-10 flex flex-col justify-start overflow-y-auto max-h-screen">
        {role === 'admin' && (
          <div className="mb-6 flex items-center gap-3 bg-[#0c0c0c] border border-neutral-900 rounded-xl p-1.5 w-fit select-none">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'personal'
                  ? 'bg-[#be0919] text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Finances (Figma Dashboard)</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#be0919] text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Payroll Management</span>
            </button>
          </div>
        )}

        {role === 'admin' ? (
          activeTab === 'personal' ? <EmployeeFinanceView /> : <AdminFinanceView />
        ) : (
          <EmployeeFinanceView />
        )}
      </div>
    </div>
  );
}

